// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

const {
  StringPrototypeCharCodeAt,
  StringPrototypeIndexOf,
  StringPrototypeLastIndexOf,
  StringPrototypeReplace,
  StringPrototypeSlice,
  StringPrototypeToLowerCase,
} = require('./primordials');

const {
  CHAR_UPPERCASE_A,
  CHAR_LOWERCASE_A,
  CHAR_UPPERCASE_Z,
  CHAR_LOWERCASE_Z,
  CHAR_DOT,
  CHAR_FORWARD_SLASH,
  CHAR_BACKWARD_SLASH,
  CHAR_COLON,
} = require('./constants');
const {
  validateString,
} = require('./validators');

const platformIsWin32 = (process.platform === 'win32');

function isPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}

function isPosixPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH;
}

function isWindowsDeviceRoot(code) {
  return (code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z) ||
         (code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z);
}

// Resolves . and .. elements in a path with directory names
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
  let res = typeof path === 'string' ? '' : Buffer.from('');
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = StringPrototypeCharCodeAt(path, i);
    else if (isPathSeparator(code))
      break;
    else
      code = CHAR_FORWARD_SLASH;

    if (isPathSeparator(code)) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 ||
            StringPrototypeCharCodeAt(res, res.length - 1) !== CHAR_DOT ||
            StringPrototypeCharCodeAt(res, res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = StringPrototypeLastIndexOf(res, separator);
            if (lastSlashIndex === -1) {
              res = typeof path === 'string' ? '' : Buffer.from('');
              lastSegmentLength = 0;
            } else {
              res = StringPrototypeSlice(res, 0, lastSlashIndex);
              lastSegmentLength =
                res.length - 1 - StringPrototypeLastIndexOf(res, separator);
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = typeof path === 'string' ? '' : Buffer.from('');
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (typeof path === 'string')
            res += res.length > 0 ? `${separator}..` : '..';
          else
            res = Buffer.concat([res, Buffer.from(res.length > 0 ? `${separator}..` : '..')]);
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          if (typeof path === 'string')
            res += `${separator}${StringPrototypeSlice(path, lastSlash + 1, i)}`;
          else
            res = Buffer.concat([res, Buffer.from(separator), StringPrototypeSlice(path, lastSlash + 1, i)]);
        } else {
          res = StringPrototypeSlice(path, lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

const win32 = {
  /**
   * path.resolve([from ...], to)
   * @param {...string | Buffer} args
   * @returns {string | Buffer}
   */
  resolve(...args) {
    const bufferMode = args.length > 0 && typeof args[0] !== 'string';
    let resolvedDevice = bufferMode ? Buffer.from('') : '';
    let resolvedTail = bufferMode ? Buffer.from('') : '';
    let resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1; i--) {
      let path;
      if (i >= 0) {
        path = args[i];
        validateString(path, 'path');

        // Skip empty entries
        if (path.length === 0) {
          continue;
        }
      } else if (resolvedDevice.length === 0) {
        path = bufferMode ? Buffer.from(process.cwd()) : process.cwd();
      } else {
        // Windows has the concept of drive-specific current working
        // directories. If we've resolved a drive letter but not yet an
        // absolute path, get cwd for that drive, or the process cwd if
        // the drive cwd is not available. We're sure the device is not
        // a UNC path at this points, because UNC paths are always absolute.
        path = process.env[`=${resolvedDevice}`] || process.cwd();
        if (bufferMode) {
          path = Buffer.from(path);
        }

        // Verify that a cwd was found and that it actually points
        // to our drive. If not, default to the drive's root.
        if (bufferMode) {
          if (path === undefined ||
              (Buffer.compare(
                  StringPrototypeToLowerCase(StringPrototypeSlice(path, 0, 2)),
                  StringPrototypeToLowerCase(resolvedDevice),
                ) !== 0 &&
                StringPrototypeCharCodeAt(path, 2) === CHAR_BACKWARD_SLASH)) {
            path = Buffer.concat([resolvedDevice, Buffer.from('\\')]);
          }
        } else {
          if (path === undefined ||
              (StringPrototypeToLowerCase(StringPrototypeSlice(path, 0, 2)) !==
                  StringPrototypeToLowerCase(resolvedDevice) &&
                  StringPrototypeCharCodeAt(path, 2) === CHAR_BACKWARD_SLASH)) {
            path = `${resolvedDevice}\\`;
          }
        }
      }

      const len = path.length;
      let rootEnd = 0;
      let device = bufferMode ? Buffer.from('') : '';
      let isAbsolute = false;
      const code = StringPrototypeCharCodeAt(path, 0);

      // Try to match a root
      if (len === 1) {
        if (isPathSeparator(code)) {
          // `path` contains just a path separator
          rootEnd = 1;
          isAbsolute = true;
        }
      } else if (isPathSeparator(code)) {
        // Possible UNC root

        // If we started with a separator, we know we at least have an
        // absolute path of some kind (UNC or otherwise)
        isAbsolute = true;

        if (isPathSeparator(StringPrototypeCharCodeAt(path, 1))) {
          // Matched double path separator at beginning
          let j = 2;
          let last = j;
          // Match 1 or more non-path separators
          while (j < len &&
                 !isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
            j++;
          }
          if (j < len && j !== last) {
            const firstPart = StringPrototypeSlice(path, last, j);
            // Matched!
            last = j;
            // Match 1 or more path separators
            while (j < len &&
                   isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
              j++;
            }
            if (j < len && j !== last) {
              // Matched!
              last = j;
              // Match 1 or more non-path separators
              while (j < len &&
                     !isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
                j++;
              }
              if (j === len || j !== last) {
                // We matched a UNC root
                if (bufferMode)
                  device = Buffer.concat([
                    Buffer.from('\\\\'),
                    firstPart,
                    Buffer.from('\\'),
                    StringPrototypeSlice(path, last, j),
                  ]);
                else
                  device =
                    `\\\\${firstPart}\\${StringPrototypeSlice(path, last, j)}`;
                rootEnd = j;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code) &&
                  StringPrototypeCharCodeAt(path, 1) === CHAR_COLON) {
        // Possible device root
        device = StringPrototypeSlice(path, 0, 2);
        rootEnd = 2;
        if (len > 2 && isPathSeparator(StringPrototypeCharCodeAt(path, 2))) {
          // Treat separator following drive name as an absolute path
          // indicator
          isAbsolute = true;
          rootEnd = 3;
        }
      }

      if (device.length > 0) {
        if (resolvedDevice.length > 0) {
          if ((bufferMode &&
              Buffer.compare(StringPrototypeToLowerCase(device), StringPrototypeToLowerCase(resolvedDevice)) !== 0) ||
              (!bufferMode &&
                StringPrototypeToLowerCase(device) !==
                StringPrototypeToLowerCase(resolvedDevice)))
            // This path points to another device so it is not applicable
            continue;
        } else {
          resolvedDevice = device;
        }
      }

      if (resolvedAbsolute) {
        if (resolvedDevice.length > 0)
          break;
      } else {
        if (bufferMode) {
          resolvedTail =
              Buffer.concat([StringPrototypeSlice(path, rootEnd), Buffer.from('\\'), resolvedTail]);
        } else {
          resolvedTail =
              `${StringPrototypeSlice(path, rootEnd)}\\${resolvedTail}`;
        }
        resolvedAbsolute = isAbsolute;
        if (isAbsolute && resolvedDevice.length > 0) {
          break;
        }
      }
    }

    // At this point the path should be resolved to a full absolute path,
    // but handle relative paths to be safe (might happen when process.cwd()
    // fails)

    // Normalize the tail path
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, '\\',
                                   isPathSeparator);

    if (bufferMode) {
      if (resolvedAbsolute) {
        return Buffer.concat([resolvedDevice, Buffer.from('\\'), resolvedTail]);
      } else {
        const result = Buffer.concat([resolvedDevice, resolvedTail]);
        return result.length > 0 ? result : Buffer.from('.');
      }
    }
    return resolvedAbsolute ?
      `${resolvedDevice}\\${resolvedTail}` :
      `${resolvedDevice}${resolvedTail}` || '.';
  },

  /**
   * @param {string | Buffer} path
   * @returns {string | Buffer}
   */
  normalize(path) {
    validateString(path, 'path');
    const len = path.length;
    if (len === 0)
      return typeof path === 'string' ? '.' : Buffer.from('.');
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = StringPrototypeCharCodeAt(path, 0);

    // Try to match a root
    if (len === 1) {
      // `path` contains just a single char, exit early to avoid
      // unnecessary work
      return isPosixPathSeparator(code) ? (typeof path === 'string' ? '\\' : Buffer.from('\\')) : path;
    }
    if (isPathSeparator(code)) {
      // Possible UNC root

      // If we started with a separator, we know we at least have an absolute
      // path of some kind (UNC or otherwise)
      isAbsolute = true;

      if (isPathSeparator(StringPrototypeCharCodeAt(path, 1))) {
        // Matched double path separator at beginning
        let j = 2;
        let last = j;
        // Match 1 or more non-path separators
        while (j < len &&
               !isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
          j++;
        }
        if (j < len && j !== last) {
          const firstPart = StringPrototypeSlice(path, last, j);
          // Matched!
          last = j;
          // Match 1 or more path separators
          while (j < len &&
                 isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
            j++;
          }
          if (j < len && j !== last) {
            // Matched!
            last = j;
            // Match 1 or more non-path separators
            while (j < len &&
                   !isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
              j++;
            }
            if (j === len) {
              // We matched a UNC root only
              // Return the normalized version of the UNC root since there
              // is nothing left to process
              if (typeof path === 'string')
                return `\\\\${firstPart}\\${StringPrototypeSlice(path, last)}\\`;
              else
                return Buffer.concat([
                  Buffer.from('\\\\'),
                  firstPart,
                  Buffer.from('\\'),
                  StringPrototypeSlice(path, last),
                  Buffer.from('\\'),
                ]);
            }
            if (j !== last) {
              // We matched a UNC root with leftovers
              if (typeof path === 'string')
                device =
                  `\\\\${firstPart}\\${StringPrototypeSlice(path, last, j)}`;
              else
                device = Buffer.concat([
                  Buffer.from('\\\\'),
                  firstPart,
                  Buffer.from('\\'),
                  StringPrototypeSlice(path, last, j),
                ]);
              rootEnd = j;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot(code) &&
               StringPrototypeCharCodeAt(path, 1) === CHAR_COLON) {
      // Possible device root
      device = StringPrototypeSlice(path, 0, 2);
      rootEnd = 2;
      if (len > 2 && isPathSeparator(StringPrototypeCharCodeAt(path, 2))) {
        // Treat separator following drive name as an absolute path
        // indicator
        isAbsolute = true;
        rootEnd = 3;
      }
    }

    let tail = rootEnd < len ?
      normalizeString(StringPrototypeSlice(path, rootEnd),
                      !isAbsolute, '\\', isPathSeparator) :
      typeof path === 'string' ? '' : Buffer.from('');
    if (tail.length === 0 && !isAbsolute)
      tail = typeof path === 'string' ? '.' : Buffer.from('.');
    if (tail.length > 0 &&
        isPathSeparator(StringPrototypeCharCodeAt(path, len - 1))) {
      if (typeof tail === 'string')
        tail += '\\';
      else
        tail = Buffer.concat([tail, Buffer.from('\\')]);
    }
    if (device === undefined) {
      return isAbsolute ?
          (typeof tail === 'string' ? `\\${tail}` : Buffer.concat([Buffer.from('\\'), tail])) :
          tail;
    }
    if (typeof tail === 'string')
      return isAbsolute ? `${device}\\${tail}` : `${device}${tail}`;
    else
      return isAbsolute ?
          Buffer.concat([device, Buffer.from('\\'), tail]) :
          Buffer.concat([device, tail]);
  },

  /**
   * @param {string | Buffer} path
   * @returns {boolean}
   */
  isAbsolute(path) {
    validateString(path, 'path');
    const len = path.length;
    if (len === 0)
      return false;

    const code = StringPrototypeCharCodeAt(path, 0);
    return isPathSeparator(code) ||
      // Possible device root
      (len > 2 &&
      isWindowsDeviceRoot(code) &&
      StringPrototypeCharCodeAt(path, 1) === CHAR_COLON &&
      isPathSeparator(StringPrototypeCharCodeAt(path, 2)));
  },

  /**
   * @param {...string | Buffer} args
   * @returns {string | Buffer}
   */
  join(...args) {
    if (args.length === 0)
      return '.';

    const bufferMode = typeof args[0] !== 'string';
    let joined;
    let firstPart;
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      validateString(arg, 'path');
      if (arg.length > 0) {
        if (joined === undefined)
          joined = firstPart = arg;
        else if (bufferMode)
          joined = Buffer.concat([joined, Buffer.from('\\'), arg]);
        else
          joined += `\\${arg}`;
      }
    }

    if (joined === undefined)
      return bufferMode ? Buffer.from('.') : '.';

    // Make sure that the joined path doesn't start with two slashes, because
    // normalize() will mistake it for a UNC path then.
    //
    // This step is skipped when it is very clear that the user actually
    // intended to point at a UNC path. This is assumed when the first
    // non-empty string arguments starts with exactly two slashes followed by
    // at least one more non-slash character.
    //
    // Note that for normalize() to treat a path as a UNC path it needs to
    // have at least 2 components, so we don't filter for that here.
    // This means that the user can use join to construct UNC paths from
    // a server name and a share name; for example:
    //   path.join('//server', 'share') -> '\\\\server\\share\\')
    let needsReplace = true;
    let slashCount = 0;
    if (isPathSeparator(StringPrototypeCharCodeAt(firstPart, 0))) {
      ++slashCount;
      const firstLen = firstPart.length;
      if (firstLen > 1 &&
          isPathSeparator(StringPrototypeCharCodeAt(firstPart, 1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(StringPrototypeCharCodeAt(firstPart, 2)))
            ++slashCount;
          else {
            // We matched a UNC path in the first part
            needsReplace = false;
          }
        }
      }
    }
    if (needsReplace) {
      // Find any more consecutive slashes we need to replace
      while (slashCount < joined.length &&
             isPathSeparator(StringPrototypeCharCodeAt(joined, slashCount))) {
        slashCount++;
      }

      // Replace the slashes if needed
      if (slashCount >= 2)
        joined = bufferMode ?
            Buffer.concat([Buffer.from('\\'), StringPrototypeSlice(joined, slashCount)]) :
            `\\${StringPrototypeSlice(joined, slashCount)}`;
    }

    return win32.normalize(joined);
  },

  /**
   * It will solve the relative path from `from` to `to`, for instance
   * from = 'C:\\orandea\\test\\aaa'
   * to = 'C:\\orandea\\impl\\bbb'
   * The output of the function should be: '..\\..\\impl\\bbb'
   * @param {string | Buffer} from
   * @param {string | Buffer} to
   * @returns {string | Buffer}
   */
  relative(from, to) {
    validateString(from, 'from');
    validateString(to, 'to');

    if (typeof from === 'string' && from === to)
      return '';
    if (typeof from !== 'string' && Buffer.compare(from, to) === 0)
      return Buffer.from('');

    const fromOrig = win32.resolve(from);
    const toOrig = win32.resolve(to);

    if (typeof from === 'string' && fromOrig === toOrig)
      return '';
    if (typeof from !== 'string' && Buffer.compare(fromOrig, toOrig) === 0)
      return Buffer.from('');

    from = StringPrototypeToLowerCase(fromOrig);
    to = StringPrototypeToLowerCase(toOrig);

    if (typeof from === 'string' && from === to)
      return '';
    if (typeof from !== 'string' && Buffer.compare(from, to) === 0)
      return Buffer.from('');

    // Trim any leading backslashes
    let fromStart = 0;
    while (fromStart < from.length &&
           StringPrototypeCharCodeAt(from, fromStart) === CHAR_BACKWARD_SLASH) {
      fromStart++;
    }
    // Trim trailing backslashes (applicable to UNC paths only)
    let fromEnd = from.length;
    while (
      fromEnd - 1 > fromStart &&
      StringPrototypeCharCodeAt(from, fromEnd - 1) === CHAR_BACKWARD_SLASH
    ) {
      fromEnd--;
    }
    const fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    let toStart = 0;
    while (toStart < to.length &&
           StringPrototypeCharCodeAt(to, toStart) === CHAR_BACKWARD_SLASH) {
      toStart++;
    }
    // Trim trailing backslashes (applicable to UNC paths only)
    let toEnd = to.length;
    while (toEnd - 1 > toStart &&
           StringPrototypeCharCodeAt(to, toEnd - 1) === CHAR_BACKWARD_SLASH) {
      toEnd--;
    }
    const toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for (; i < length; i++) {
      const fromCode = StringPrototypeCharCodeAt(from, fromStart + i);
      if (fromCode !== StringPrototypeCharCodeAt(to, toStart + i))
        break;
      else if (fromCode === CHAR_BACKWARD_SLASH)
        lastCommonSep = i;
    }

    // We found a mismatch before the first common path separator was seen, so
    // return the original `to`.
    if (i !== length) {
      if (lastCommonSep === -1)
        return toOrig;
    } else {
      if (toLen > length) {
        if (StringPrototypeCharCodeAt(to, toStart + i) ===
            CHAR_BACKWARD_SLASH) {
          // We get here if `from` is the exact base path for `to`.
          // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
          return StringPrototypeSlice(toOrig, toStart + i + 1);
        }
        if (i === 2) {
          // We get here if `from` is the device root.
          // For example: from='C:\\'; to='C:\\foo'
          return StringPrototypeSlice(toOrig, toStart + i);
        }
      }
      if (fromLen > length) {
        if (StringPrototypeCharCodeAt(from, fromStart + i) ===
            CHAR_BACKWARD_SLASH) {
          // We get here if `to` is the exact base path for `from`.
          // For example: from='C:\\foo\\bar'; to='C:\\foo'
          lastCommonSep = i;
        } else if (i === 2) {
          // We get here if `to` is the device root.
          // For example: from='C:\\foo\\bar'; to='C:\\'
          lastCommonSep = 3;
        }
      }
      if (lastCommonSep === -1)
        lastCommonSep = 0;
    }

    let out = '';
    // Generate the relative path based on the path difference between `to` and
    // `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd ||
          StringPrototypeCharCodeAt(from, i) === CHAR_BACKWARD_SLASH) {
        out += out.length === 0 ? '..' : '\\..';
      }
    }

    toStart += lastCommonSep;

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0) {
      if (typeof from === 'string')
        return `${out}${StringPrototypeSlice(toOrig, toStart, toEnd)}`;
      else
        return Buffer.concat([Buffer.from(out), StringPrototypeSlice(toOrig, toStart, toEnd)]);
    }

    if (StringPrototypeCharCodeAt(toOrig, toStart) === CHAR_BACKWARD_SLASH)
      ++toStart;
    return StringPrototypeSlice(toOrig, toStart, toEnd);
  },

  /**
   * @param {string | Buffer} path
   * @returns {string | Buffer}
   */
  dirname(path) {
    validateString(path, 'path');
    const len = path.length;
    if (len === 0)
      return typeof path === 'string' ? '.' : Buffer.from('.');
    let rootEnd = -1;
    let offset = 0;
    const code = StringPrototypeCharCodeAt(path, 0);

    if (len === 1) {
      // `path` contains just a path separator, exit early to avoid
      // unnecessary work or a dot.
      return isPathSeparator(code) ? path : typeof path === 'string' ? '.' : Buffer.from('.');
    }

    // Try to match a root
    if (isPathSeparator(code)) {
      // Possible UNC root

      rootEnd = offset = 1;

      if (isPathSeparator(StringPrototypeCharCodeAt(path, 1))) {
        // Matched double path separator at beginning
        let j = 2;
        let last = j;
        // Match 1 or more non-path separators
        while (j < len &&
               !isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
          j++;
        }
        if (j < len && j !== last) {
          // Matched!
          last = j;
          // Match 1 or more path separators
          while (j < len &&
                 isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
            j++;
          }
          if (j < len && j !== last) {
            // Matched!
            last = j;
            // Match 1 or more non-path separators
            while (j < len &&
                   !isPathSeparator(StringPrototypeCharCodeAt(path, j))) {
              j++;
            }
            if (j === len) {
              // We matched a UNC root only
              return path;
            }
            if (j !== last) {
              // We matched a UNC root with leftovers

              // Offset by 1 to include the separator after the UNC root to
              // treat it as a "normal root" on top of a (UNC) root
              rootEnd = offset = j + 1;
            }
          }
        }
      }
    // Possible device root
    } else if (isWindowsDeviceRoot(code) &&
               StringPrototypeCharCodeAt(path, 1) === CHAR_COLON) {
      rootEnd =
        len > 2 && isPathSeparator(StringPrototypeCharCodeAt(path, 2)) ? 3 : 2;
      offset = rootEnd;
    }

    let end = -1;
    let matchedSlash = true;
    for (let i = len - 1; i >= offset; --i) {
      if (isPathSeparator(StringPrototypeCharCodeAt(path, i))) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) {
      if (rootEnd === -1)
        return typeof path === 'string' ? '.' : Buffer.from('.');

      end = rootEnd;
    }
    return StringPrototypeSlice(path, 0, end);
  },

  /**
   * @param {string | Buffer} path
   * @param {string} [suffix]
   * @returns {string | Buffer}
   */
  basename(path, suffix) {
    if (suffix !== undefined)
      validateString(suffix, 'ext');
    validateString(path, 'path');
    let start = 0;
    let end = -1;
    let matchedSlash = true;

    // Check for a drive letter prefix so as not to mistake the following
    // path separator as an extra separator at the end of the path that can be
    // disregarded
    if (path.length >= 2 &&
        isWindowsDeviceRoot(StringPrototypeCharCodeAt(path, 0)) &&
        StringPrototypeCharCodeAt(path, 1) === CHAR_COLON) {
      start = 2;
    }

    if (suffix !== undefined && suffix.length > 0 && suffix.length <= path.length) {
      if (suffix === path.toString())
        return typeof path === 'string' ? '' : Buffer.from('');
      let extIdx = suffix.length - 1;
      let firstNonSlashEnd = -1;
      for (let i = path.length - 1; i >= start; --i) {
        const code = StringPrototypeCharCodeAt(path, i);
        if (isPathSeparator(code)) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === StringPrototypeCharCodeAt(suffix, extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end)
        end = firstNonSlashEnd;
      else if (end === -1)
        end = path.length;
      return StringPrototypeSlice(path, start, end);
    }
    for (let i = path.length - 1; i >= start; --i) {
      if (isPathSeparator(StringPrototypeCharCodeAt(path, i))) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end = i + 1;
      }
    }

    if (end === -1)
      return typeof path === 'string' ? '' : Buffer.from('');
    return StringPrototypeSlice(path, start, end);
  },

  /**
   * @param {string | Buffer} path
   * @returns {string | Buffer}
   */
  extname(path) {
    validateString(path, 'path');
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    let preDotState = 0;

    // Check for a drive letter prefix so as not to mistake the following
    // path separator as an extra separator at the end of the path that can be
    // disregarded

    if (path.length >= 2 &&
        StringPrototypeCharCodeAt(path, 1) === CHAR_COLON &&
        isWindowsDeviceRoot(StringPrototypeCharCodeAt(path, 0))) {
      start = startPart = 2;
    }

    for (let i = path.length - 1; i >= start; --i) {
      const code = StringPrototypeCharCodeAt(path, i);
      if (isPathSeparator(code)) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      return typeof path === 'string' ? '' : Buffer.from('');
    }
    return StringPrototypeSlice(path, startDot, end);
  },

  sep: '\\',
  delimiter: ';',
  win32: null,
  posix: null
};

const posixCwd = (() => {
  if (platformIsWin32) {
    // Converts Windows' backslash path separators to POSIX forward slashes
    // and truncates any drive indicator
    const regexp = /\\/g;
    return () => {
      const cwd = StringPrototypeReplace(process.cwd(), regexp, '/');
      return StringPrototypeSlice(cwd, StringPrototypeIndexOf(cwd, '/'));
    };
  }

  // We're already on POSIX, no need for any transformations
  return () => process.cwd();
})();

const posix = {
  /**
   * path.resolve([from ...], to)
   * @param {...string | Buffer} args
   * @returns {string | Buffer}
   */
  resolve(...args) {
    const bufferMode = args.length > 0 && typeof args[0] !== 'string';
    let resolvedPath = bufferMode ? Buffer.from('') : '';
    let resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = i >= 0 ? args[i] : bufferMode ? Buffer.from(posixCwd()) : posixCwd();

      validateString(path, 'path');

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      if (bufferMode)
        resolvedPath = Buffer.concat([path, Buffer.from('/'), resolvedPath]);
      else
        resolvedPath = `${path}/${resolvedPath}`;
      resolvedAbsolute =
        StringPrototypeCharCodeAt(path, 0) === CHAR_FORWARD_SLASH;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/',
                                   isPosixPathSeparator);

    if (resolvedAbsolute) {
      return bufferMode ? Buffer.concat([Buffer.from('/'), resolvedPath]) : `/${resolvedPath}`;
    }
    return resolvedPath.length > 0 ? resolvedPath : bufferMode ? Buffer.from('.') : '.';
  },

  /**
   * @param {string | Buffer} path
   * @returns {string | Buffer}
   */
  normalize(path) {
    validateString(path, 'path');

    if (path.length === 0)
      return typeof path === 'string' ? '.' : Buffer.from('.');

    const isAbsolute =
      StringPrototypeCharCodeAt(path, 0) === CHAR_FORWARD_SLASH;
    const trailingSeparator =
      StringPrototypeCharCodeAt(path, path.length - 1) === CHAR_FORWARD_SLASH;

    // Normalize the path
    path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);

    if (path.length === 0) {
      if (isAbsolute)
        return typeof path === 'string' ? '/' : Buffer.from('/');
      return typeof path === 'string' ?
          (trailingSeparator ? './' : '.') :
          Buffer.from(trailingSeparator ? './' : '.');
    }
    if (trailingSeparator) {
      if (typeof path === 'string')
        path += '/';
      else
        path = Buffer.concat([path, Buffer.from('/')]);
    }

    return isAbsolute ?
        typeof path === 'string' ? `/${path}` : Buffer.concat([Buffer.from('/'), path])
        : path;
  },

  /**
   * @param {string | Buffer} path
   * @returns {boolean}
   */
  isAbsolute(path) {
    validateString(path, 'path');
    return path.length > 0 &&
           StringPrototypeCharCodeAt(path, 0) === CHAR_FORWARD_SLASH;
  },

  /**
   * @param {...string | Buffer} args
   * @returns {string | Buffer}
   */
  join(...args) {
    if (args.length === 0)
      return '.';
    const bufferMode = typeof args[0] !== 'string';
    let joined;
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      validateString(arg, 'path');
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else if (bufferMode)
          joined = Buffer.concat([joined, Buffer.from('/'), arg]);
        else
          joined += `/${arg}`;
      }
    }
    if (joined === undefined)
      return bufferMode ? Buffer.from('.') : '.';
    return posix.normalize(joined);
  },

  /**
   * @param {string | Buffer} from
   * @param {string | Buffer} to
   * @returns {string | Buffer}
   */
  relative(from, to) {
    validateString(from, 'from');
    validateString(to, 'to');

    if (typeof from === 'string' && from === to)
      return '';
    if (typeof from !== 'string' && Buffer.compare(from, to) === 0)
      return Buffer.from('');

    // Trim leading forward slashes.
    from = posix.resolve(from);
    to = posix.resolve(to);

    if (typeof from === 'string' && from === to)
      return '';
    if (typeof from !== 'string' && Buffer.compare(from, to) === 0)
      return Buffer.from('');

    const fromStart = 1;
    const fromEnd = from.length;
    const fromLen = fromEnd - fromStart;
    const toStart = 1;
    const toLen = to.length - toStart;

    // Compare paths to find the longest common path from root
    const length = (fromLen < toLen ? fromLen : toLen);
    let lastCommonSep = -1;
    let i = 0;
    for (; i < length; i++) {
      const fromCode = StringPrototypeCharCodeAt(from, fromStart + i);
      if (fromCode !== StringPrototypeCharCodeAt(to, toStart + i))
        break;
      else if (fromCode === CHAR_FORWARD_SLASH)
        lastCommonSep = i;
    }
    if (i === length) {
      if (toLen > length) {
        if (StringPrototypeCharCodeAt(to, toStart + i) === CHAR_FORWARD_SLASH) {
          // We get here if `from` is the exact base path for `to`.
          // For example: from='/foo/bar'; to='/foo/bar/baz'
          return StringPrototypeSlice(to, toStart + i + 1);
        }
        if (i === 0) {
          // We get here if `from` is the root
          // For example: from='/'; to='/foo'
          return StringPrototypeSlice(to, toStart + i);
        }
      } else if (fromLen > length) {
        if (StringPrototypeCharCodeAt(from, fromStart + i) ===
            CHAR_FORWARD_SLASH) {
          // We get here if `to` is the exact base path for `from`.
          // For example: from='/foo/bar/baz'; to='/foo/bar'
          lastCommonSep = i;
        } else if (i === 0) {
          // We get here if `to` is the root.
          // For example: from='/foo/bar'; to='/'
          lastCommonSep = 0;
        }
      }
    }

    let out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`.
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd ||
          StringPrototypeCharCodeAt(from, i) === CHAR_FORWARD_SLASH) {
        out += out.length === 0 ? '..' : '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts.
    return `${out}${StringPrototypeSlice(to, toStart + lastCommonSep)}`;
  },

  /**
   * @param {string | Buffer} path
   * @returns {string | Buffer}
   */
  dirname(path) {
    validateString(path, 'path');
    if (path.length === 0)
      return typeof path === 'string' ? '.' : Buffer.from('.');
    const hasRoot = StringPrototypeCharCodeAt(path, 0) === CHAR_FORWARD_SLASH;
    let end = -1;
    let matchedSlash = true;
    for (let i = path.length - 1; i >= 1; --i) {
      if (StringPrototypeCharCodeAt(path, i) === CHAR_FORWARD_SLASH) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1)
      return typeof path === 'string' ? (hasRoot ? '/' : '.') : Buffer.from(hasRoot ? '/' : '.');
    if (hasRoot && end === 1)
      return typeof path === 'string' ? '//' : Buffer.from('//');
    return StringPrototypeSlice(path, 0, end);
  },

  /**
   * @param {string | Buffer} path
   * @param {string} [suffix]
   * @returns {string | Buffer}
   */
  basename(path, suffix) {
    if (suffix !== undefined)
      validateString(suffix, 'ext');
    validateString(path, 'path');

    let start = 0;
    let end = -1;
    let matchedSlash = true;

    if (suffix !== undefined && suffix.length > 0 && suffix.length <= path.length) {
      if (suffix === path.toString())
        return typeof path === 'string' ? '' : Buffer.from('');
      let extIdx = suffix.length - 1;
      let firstNonSlashEnd = -1;
      for (let i = path.length - 1; i >= 0; --i) {
        const code = StringPrototypeCharCodeAt(path, i);
        if (code === CHAR_FORWARD_SLASH) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === StringPrototypeCharCodeAt(suffix, extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end)
        end = firstNonSlashEnd;
      else if (end === -1)
        end = path.length;
      return StringPrototypeSlice(path, start, end);
    }
    for (let i = path.length - 1; i >= 0; --i) {
      if (StringPrototypeCharCodeAt(path, i) === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end = i + 1;
      }
    }

    if (end === -1)
      return typeof path === 'string' ? '' : Buffer.from('');
    return StringPrototypeSlice(path, start, end);
  },

  /**
   * @param {string | Buffer} path
   * @returns {string | Buffer}
   */
  extname(path) {
    validateString(path, 'path');
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    let preDotState = 0;
    for (let i = path.length - 1; i >= 0; --i) {
      const code = StringPrototypeCharCodeAt(path, i);
      if (code === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      return typeof path === 'string' ? '' : Buffer.from('');
    }
    return StringPrototypeSlice(path, startDot, end);
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.win32 = win32.win32 = win32;
posix.posix = win32.posix = posix;

module.exports = platformIsWin32 ? win32 : posix;
