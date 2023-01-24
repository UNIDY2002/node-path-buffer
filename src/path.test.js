'use strict';

const assert = require('assert');
const path = require('./path');

describe('basename', function () {
    describe('string', function () {
        it('should return basename', function () {
            assert.strictEqual(path.basename(__filename), 'path.test.js');
            assert.strictEqual(path.basename(__filename, '.js'), 'path.test');
            assert.strictEqual(path.basename('.js', '.js'), '');
            assert.strictEqual(path.basename('js', '.js'), 'js');
            assert.strictEqual(path.basename('file.js', '.ts'), 'file.js');
            assert.strictEqual(path.basename('file', '.js'), 'file');
            assert.strictEqual(path.basename('file.js.old', '.js.old'), 'file');
            assert.strictEqual(path.basename(''), '');
            assert.strictEqual(path.basename('/dir/basename.ext'), 'basename.ext');
            assert.strictEqual(path.basename('/basename.ext'), 'basename.ext');
            assert.strictEqual(path.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.basename('basename.ext/'), 'basename.ext');
            assert.strictEqual(path.basename('basename.ext//'), 'basename.ext');
            assert.strictEqual(path.basename('aaa/bbb', '/bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb', 'a/bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb//', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb', 'bb'), 'b');
            assert.strictEqual(path.basename('aaa/bbb', 'b'), 'bb');
            assert.strictEqual(path.basename('/aaa/bbb', '/bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb', 'a/bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb//', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb', 'bb'), 'b');
            assert.strictEqual(path.basename('/aaa/bbb', 'b'), 'bb');
            assert.strictEqual(path.basename('/aaa/bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/'), 'aaa');
            assert.strictEqual(path.basename('/aaa/b'), 'b');
            assert.strictEqual(path.basename('/a/b'), 'b');
            assert.strictEqual(path.basename('//a'), 'a');
            assert.strictEqual(path.basename('a', 'a'), '');

            // On Windows a backslash acts as a path separator.
            assert.strictEqual(path.win32.basename('\\dir\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('basename.ext\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('basename.ext\\\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('foo'), 'foo');
            assert.strictEqual(path.win32.basename('aaa\\bbb', '\\bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'a\\bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb\\\\\\\\', 'bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'bb'), 'b');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'b'), 'bb');
            assert.strictEqual(path.win32.basename('C:'), '');
            assert.strictEqual(path.win32.basename('C:.'), '.');
            assert.strictEqual(path.win32.basename('C:\\'), '');
            assert.strictEqual(path.win32.basename('C:\\dir\\base.ext'), 'base.ext');
            assert.strictEqual(path.win32.basename('C:\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:basename.ext\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:basename.ext\\\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:foo'), 'foo');
            assert.strictEqual(path.win32.basename('file:stream'), 'file:stream');
            assert.strictEqual(path.win32.basename('a', 'a'), '');

            // On unix a backslash is just treated as any other character.
            assert.strictEqual(path.posix.basename('\\dir\\basename.ext'),
                '\\dir\\basename.ext');
            assert.strictEqual(path.posix.basename('\\basename.ext'), '\\basename.ext');
            assert.strictEqual(path.posix.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.posix.basename('basename.ext\\'), 'basename.ext\\');
            assert.strictEqual(path.posix.basename('basename.ext\\\\'), 'basename.ext\\\\');
            assert.strictEqual(path.posix.basename('foo'), 'foo');

            // POSIX filenames may include control characters
            // c.f. http://www.dwheeler.com/essays/fixing-unix-linux-filenames.html
            const controlCharFilename = `Icon${String.fromCharCode(13)}`;
            assert.strictEqual(path.posix.basename(`/a/b/${controlCharFilename}`),
                controlCharFilename);
        });
    });

    describe('buffer', function () {
        it('should return basename', function () {
            assert.deepEqual(path.basename(Buffer.from(__filename)), Buffer.from('path.test.js'));
            assert.deepEqual(path.basename(Buffer.from(__filename)), Buffer.from('path.test.js'));
            assert.deepEqual(path.basename(Buffer.from(__filename), '.js'), Buffer.from('path.test'));
            assert.deepEqual(path.basename(Buffer.from('.js'), '.js'), Buffer.from(''));
            assert.deepEqual(path.basename(Buffer.from('js'), '.js'), Buffer.from('js'));
            assert.deepEqual(path.basename(Buffer.from('file.js'), '.ts'), Buffer.from('file.js'));
            assert.deepEqual(path.basename(Buffer.from('file'), '.js'), Buffer.from('file'));
            assert.deepEqual(path.basename(Buffer.from('file.js.old'), '.js.old'), Buffer.from('file'));
            assert.deepEqual(path.basename(Buffer.from('')), Buffer.from(''));
            assert.deepEqual(path.basename(Buffer.from('/dir/basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.basename(Buffer.from('/basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.basename(Buffer.from('basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.basename(Buffer.from('basename.ext/')), Buffer.from('basename.ext'));
            assert.deepEqual(path.basename(Buffer.from('basename.ext//')), Buffer.from('basename.ext'));
            assert.deepEqual(path.basename(Buffer.from('aaa/bbb'), '/bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('aaa/bbb'), 'a/bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('aaa/bbb'), 'bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('aaa/bbb//'), 'bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('aaa/bbb'), 'bb'), Buffer.from('b'));
            assert.deepEqual(path.basename(Buffer.from('aaa/bbb'), 'b'), Buffer.from('bb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb'), '/bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb'), 'a/bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb'), 'bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb//'), 'bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb'), 'bb'), Buffer.from('b'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb'), 'b'), Buffer.from('bb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/bbb')), Buffer.from('bbb'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/')), Buffer.from('aaa'));
            assert.deepEqual(path.basename(Buffer.from('/aaa/b')), Buffer.from('b'));
            assert.deepEqual(path.basename(Buffer.from('/a/b')), Buffer.from('b'));
            assert.deepEqual(path.basename(Buffer.from('//a')), Buffer.from('a'));
            assert.deepEqual(path.basename(Buffer.from('a'), 'a'), Buffer.from(''));

            // On Windows a backslash acts as a path separator.
            assert.deepEqual(path.win32.basename(Buffer.from('\\dir\\basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('\\basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('basename.ext\\')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('basename.ext\\\\')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('foo')), Buffer.from('foo'));
            assert.deepEqual(path.win32.basename(Buffer.from('aaa\\bbb'), '\\bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.win32.basename(Buffer.from('aaa\\bbb'), 'a\\bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.win32.basename(Buffer.from('aaa\\bbb'), 'bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.win32.basename(Buffer.from('aaa\\bbb\\\\\\\\'), 'bbb'), Buffer.from('bbb'));
            assert.deepEqual(path.win32.basename(Buffer.from('aaa\\bbb'), 'bb'), Buffer.from('b'));
            assert.deepEqual(path.win32.basename(Buffer.from('aaa\\bbb'), 'b'), Buffer.from('bb'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:')), Buffer.from(''));
            assert.deepEqual(path.win32.basename(Buffer.from('C:.')), Buffer.from('.'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:\\')), Buffer.from(''));
            assert.deepEqual(path.win32.basename(Buffer.from('C:\\dir\\base.ext')), Buffer.from('base.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:\\basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:basename.ext\\')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:basename.ext\\\\')), Buffer.from('basename.ext'));
            assert.deepEqual(path.win32.basename(Buffer.from('C:foo')), Buffer.from('foo'));
            assert.deepEqual(path.win32.basename(Buffer.from('file:stream')), Buffer.from('file:stream'));
            assert.deepEqual(path.win32.basename(Buffer.from('a'), 'a'), Buffer.from(''));

            // On unix a backslash is just treated as any other character.
            assert.deepEqual(path.posix.basename(Buffer.from('\\dir\\basename.ext')),
                Buffer.from('\\dir\\basename.ext'));
            assert.deepEqual(path.posix.basename(Buffer.from('\\basename.ext')), Buffer.from('\\basename.ext'));
            assert.deepEqual(path.posix.basename(Buffer.from('basename.ext')), Buffer.from('basename.ext'));
            assert.deepEqual(path.posix.basename(Buffer.from('basename.ext\\')), Buffer.from('basename.ext\\'));
            assert.deepEqual(path.posix.basename(Buffer.from('basename.ext\\\\')), Buffer.from('basename.ext\\\\'));
            assert.deepEqual(path.posix.basename(Buffer.from('foo')), Buffer.from('foo'));

            // POSIX filenames may include control characters
            // c.f. http://www.dwheeler.com/essays/fixing-unix-linux-filenames.html
            const controlCharFilename = `Icon${String.fromCharCode(13)}`;
            assert.deepEqual(path.posix.basename(Buffer.from(`/a/b/${controlCharFilename}`)),
                Buffer.from(controlCharFilename));
        });
    });
});

describe('dirname', function () {
    describe('string', function () {
        it('should return dirname', function () {
            assert.strictEqual(path.dirname(__filename).substr(-3), 'src');

            assert.strictEqual(path.posix.dirname('/a/b/'), '/a');
            assert.strictEqual(path.posix.dirname('/a/b'), '/a');
            assert.strictEqual(path.posix.dirname('/a'), '/');
            assert.strictEqual(path.posix.dirname(''), '.');
            assert.strictEqual(path.posix.dirname('/'), '/');
            assert.strictEqual(path.posix.dirname('////'), '/');
            assert.strictEqual(path.posix.dirname('//a'), '//');
            assert.strictEqual(path.posix.dirname('foo'), '.');

            assert.strictEqual(path.win32.dirname('c:\\'), 'c:\\');
            assert.strictEqual(path.win32.dirname('c:\\foo'), 'c:\\');
            assert.strictEqual(path.win32.dirname('c:\\foo\\'), 'c:\\');
            assert.strictEqual(path.win32.dirname('c:\\foo\\bar'), 'c:\\foo');
            assert.strictEqual(path.win32.dirname('c:\\foo\\bar\\'), 'c:\\foo');
            assert.strictEqual(path.win32.dirname('c:\\foo\\bar\\baz'), 'c:\\foo\\bar');
            assert.strictEqual(path.win32.dirname('c:\\foo bar\\baz'), 'c:\\foo bar');
            assert.strictEqual(path.win32.dirname('\\'), '\\');
            assert.strictEqual(path.win32.dirname('\\foo'), '\\');
            assert.strictEqual(path.win32.dirname('\\foo\\'), '\\');
            assert.strictEqual(path.win32.dirname('\\foo\\bar'), '\\foo');
            assert.strictEqual(path.win32.dirname('\\foo\\bar\\'), '\\foo');
            assert.strictEqual(path.win32.dirname('\\foo\\bar\\baz'), '\\foo\\bar');
            assert.strictEqual(path.win32.dirname('\\foo bar\\baz'), '\\foo bar');
            assert.strictEqual(path.win32.dirname('c:'), 'c:');
            assert.strictEqual(path.win32.dirname('c:foo'), 'c:');
            assert.strictEqual(path.win32.dirname('c:foo\\'), 'c:');
            assert.strictEqual(path.win32.dirname('c:foo\\bar'), 'c:foo');
            assert.strictEqual(path.win32.dirname('c:foo\\bar\\'), 'c:foo');
            assert.strictEqual(path.win32.dirname('c:foo\\bar\\baz'), 'c:foo\\bar');
            assert.strictEqual(path.win32.dirname('c:foo bar\\baz'), 'c:foo bar');
            assert.strictEqual(path.win32.dirname('file:stream'), '.');
            assert.strictEqual(path.win32.dirname('dir\\file:stream'), 'dir');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share'),
                '\\\\unc\\share');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo'),
                '\\\\unc\\share\\');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\'),
                '\\\\unc\\share\\');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\bar'),
                '\\\\unc\\share\\foo');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\bar\\'),
                '\\\\unc\\share\\foo');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\bar\\baz'),
                '\\\\unc\\share\\foo\\bar');
            assert.strictEqual(path.win32.dirname('/a/b/'), '/a');
            assert.strictEqual(path.win32.dirname('/a/b'), '/a');
            assert.strictEqual(path.win32.dirname('/a'), '/');
            assert.strictEqual(path.win32.dirname(''), '.');
            assert.strictEqual(path.win32.dirname('/'), '/');
            assert.strictEqual(path.win32.dirname('////'), '/');
            assert.strictEqual(path.win32.dirname('foo'), '.');
        });
    });

    describe('buffer', function () {
        it('should return dirname', function () {
            assert.deepEqual(path.posix.dirname(Buffer.from('/a/b/')), Buffer.from('/a'));
            assert.deepEqual(path.posix.dirname(Buffer.from('/a/b')), Buffer.from('/a'));
            assert.deepEqual(path.posix.dirname(Buffer.from('/a')), Buffer.from('/'));
            assert.deepEqual(path.posix.dirname(Buffer.from('')), Buffer.from('.'));
            assert.deepEqual(path.posix.dirname(Buffer.from('/')), Buffer.from('/'));
            assert.deepEqual(path.posix.dirname(Buffer.from('////')), Buffer.from('/'));
            assert.deepEqual(path.posix.dirname(Buffer.from('//a')), Buffer.from('//'));
            assert.deepEqual(path.posix.dirname(Buffer.from('foo')), Buffer.from('.'));

            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\')), Buffer.from('c:\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\foo')), Buffer.from('c:\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\foo\\')), Buffer.from('c:\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\foo\\bar')), Buffer.from('c:\\foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\foo\\bar\\')), Buffer.from('c:\\foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\foo\\bar\\baz')), Buffer.from('c:\\foo\\bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:\\foo bar\\baz')), Buffer.from('c:\\foo bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\')), Buffer.from('\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\foo')), Buffer.from('\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\foo\\')), Buffer.from('\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\foo\\bar')), Buffer.from('\\foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\foo\\bar\\')), Buffer.from('\\foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\foo\\bar\\baz')), Buffer.from('\\foo\\bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\foo bar\\baz')), Buffer.from('\\foo bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:')), Buffer.from('c:'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:foo')), Buffer.from('c:'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:foo\\')), Buffer.from('c:'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:foo\\bar')), Buffer.from('c:foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:foo\\bar\\')), Buffer.from('c:foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:foo\\bar\\baz')), Buffer.from('c:foo\\bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('c:foo bar\\baz')), Buffer.from('c:foo bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('file:stream')), Buffer.from('.'));
            assert.deepEqual(path.win32.dirname(Buffer.from('dir\\file:stream')), Buffer.from('dir'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\\\unc\\share')),
                Buffer.from('\\\\unc\\share'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\\\unc\\share\\foo')),
                Buffer.from('\\\\unc\\share\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\\\unc\\share\\foo\\')),
                Buffer.from('\\\\unc\\share\\'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\\\unc\\share\\foo\\bar')),
                Buffer.from('\\\\unc\\share\\foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\\\unc\\share\\foo\\bar\\')),
                Buffer.from('\\\\unc\\share\\foo'));
            assert.deepEqual(path.win32.dirname(Buffer.from('\\\\unc\\share\\foo\\bar\\baz')),
                Buffer.from('\\\\unc\\share\\foo\\bar'));
            assert.deepEqual(path.win32.dirname(Buffer.from('/a/b/')), Buffer.from('/a'));
            assert.deepEqual(path.win32.dirname(Buffer.from('/a/b')), Buffer.from('/a'));
            assert.deepEqual(path.win32.dirname(Buffer.from('/a')), Buffer.from('/'));
            assert.deepEqual(path.win32.dirname(Buffer.from('')), Buffer.from('.'));
            assert.deepEqual(path.win32.dirname(Buffer.from('/')), Buffer.from('/'));
            assert.deepEqual(path.win32.dirname(Buffer.from('////')), Buffer.from('/'));
            assert.deepEqual(path.win32.dirname(Buffer.from('foo')), Buffer.from('.'));
        });
    });
});

describe('extname', function () {
    describe('string', function () {
        it('should return extname', function () {
            const failures = [];
            const slashRE = /\//g;

            [
                [__filename, '.js'],
                ['', ''],
                ['/path/to/file', ''],
                ['/path/to/file.ext', '.ext'],
                ['/path.to/file.ext', '.ext'],
                ['/path.to/file', ''],
                ['/path.to/.file', ''],
                ['/path.to/.file.ext', '.ext'],
                ['/path/to/f.ext', '.ext'],
                ['/path/to/..ext', '.ext'],
                ['/path/to/..', ''],
                ['file', ''],
                ['file.ext', '.ext'],
                ['.file', ''],
                ['.file.ext', '.ext'],
                ['/file', ''],
                ['/file.ext', '.ext'],
                ['/.file', ''],
                ['/.file.ext', '.ext'],
                ['.path/file.ext', '.ext'],
                ['file.ext.ext', '.ext'],
                ['file.', '.'],
                ['.', ''],
                ['./', ''],
                ['.file.ext', '.ext'],
                ['.file', ''],
                ['.file.', '.'],
                ['.file..', '.'],
                ['..', ''],
                ['../', ''],
                ['..file.ext', '.ext'],
                ['..file', '.file'],
                ['..file.', '.'],
                ['..file..', '.'],
                ['...', '.'],
                ['...ext', '.ext'],
                ['....', '.'],
                ['file.ext/', '.ext'],
                ['file.ext//', '.ext'],
                ['file/', ''],
                ['file//', ''],
                ['file./', '.'],
                ['file.//', '.'],
            ].forEach((test) => {
                const expected = test[1];
                [path.posix.extname, path.win32.extname].forEach((extname) => {
                    let input = test[0];
                    let os;
                    if (extname === path.win32.extname) {
                        input = input.replace(slashRE, '\\');
                        os = 'win32';
                    } else {
                        os = 'posix';
                    }
                    const actual = extname(input);
                    const message = `path.${os}.extname(${JSON.stringify(input)})\n  expect=${
                        JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected)
                        failures.push(`\n${message}`);
                });
                {
                    const input = `C:${test[0].replace(slashRE, '\\')}`;
                    const actual = path.win32.extname(input);
                    const message = `path.win32.extname(${JSON.stringify(input)})\n  expect=${
                        JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected)
                        failures.push(`\n${message}`);
                }
            });
            assert.strictEqual(failures.length, 0, failures.join(''));

            // On Windows, backslash is a path separator.
            assert.strictEqual(path.win32.extname('.\\'), '');
            assert.strictEqual(path.win32.extname('..\\'), '');
            assert.strictEqual(path.win32.extname('file.ext\\'), '.ext');
            assert.strictEqual(path.win32.extname('file.ext\\\\'), '.ext');
            assert.strictEqual(path.win32.extname('file\\'), '');
            assert.strictEqual(path.win32.extname('file\\\\'), '');
            assert.strictEqual(path.win32.extname('file.\\'), '.');
            assert.strictEqual(path.win32.extname('file.\\\\'), '.');

            // On *nix, backslash is a valid name component like any other character.
            assert.strictEqual(path.posix.extname('.\\'), '');
            assert.strictEqual(path.posix.extname('..\\'), '.\\');
            assert.strictEqual(path.posix.extname('file.ext\\'), '.ext\\');
            assert.strictEqual(path.posix.extname('file.ext\\\\'), '.ext\\\\');
            assert.strictEqual(path.posix.extname('file\\'), '');
            assert.strictEqual(path.posix.extname('file\\\\'), '');
            assert.strictEqual(path.posix.extname('file.\\'), '.\\');
            assert.strictEqual(path.posix.extname('file.\\\\'), '.\\\\');
        });
    });

    describe('buffer', function () {
        it('should return extname', function () {
            const failures = [];
            const slashRE = /\//g;

            [
                [__filename, '.js'],
                ['', ''],
                ['/path/to/file', ''],
                ['/path/to/file.ext', '.ext'],
                ['/path.to/file.ext', '.ext'],
                ['/path.to/file', ''],
                ['/path.to/.file', ''],
                ['/path.to/.file.ext', '.ext'],
                ['/path/to/f.ext', '.ext'],
                ['/path/to/..ext', '.ext'],
                ['/path/to/..', ''],
                ['file', ''],
                ['file.ext', '.ext'],
                ['.file', ''],
                ['.file.ext', '.ext'],
                ['/file', ''],
                ['/file.ext', '.ext'],
                ['/.file', ''],
                ['/.file.ext', '.ext'],
                ['.path/file.ext', '.ext'],
                ['file.ext.ext', '.ext'],
                ['file.', '.'],
                ['.', ''],
                ['./', ''],
                ['.file.ext', '.ext'],
                ['.file', ''],
                ['.file.', '.'],
                ['.file..', '.'],
                ['..', ''],
                ['../', ''],
                ['..file.ext', '.ext'],
                ['..file', '.file'],
                ['..file.', '.'],
                ['..file..', '.'],
                ['...', '.'],
                ['...ext', '.ext'],
                ['....', '.'],
                ['file.ext/', '.ext'],
                ['file.ext//', '.ext'],
                ['file/', ''],
                ['file//', ''],
                ['file./', '.'],
                ['file.//', '.'],
            ].forEach((test) => {
                const expected = test[1];
                [path.posix.extname, path.win32.extname].forEach((extname) => {
                    let input = test[0];
                    let os;
                    if (extname === path.win32.extname) {
                        input = input.replace(slashRE, '\\');
                        os = 'win32';
                    } else {
                        os = 'posix';
                    }
                    const actual = extname(Buffer.from(input));
                    const message = `path.${os}.extname(${JSON.stringify(input)})\n  expect=${
                        JSON.stringify(expected)}\n  actual=${JSON.stringify(actual.toString())}`;
                    if (actual.toString() !== expected)
                        failures.push(`\n${message}`);
                });
                {
                    const input = `C:${test[0].replace(slashRE, '\\')}`;
                    const actual = path.win32.extname(Buffer.from(input));
                    const message = `path.win32.extname(${JSON.stringify(input)})\n  expect=${
                        JSON.stringify(expected)}\n  actual=${JSON.stringify(actual.toString())}`;
                    if (actual.toString() !== expected)
                        failures.push(`\n${message}`);
                }
            });
            assert.strictEqual(failures.length, 0, failures.join(''));

            // On Windows, backslash is a path separator.
            assert.deepEqual(path.win32.extname(Buffer.from('.\\')), Buffer.from(''));
            assert.deepEqual(path.win32.extname(Buffer.from('..\\')), Buffer.from(''));
            assert.deepEqual(path.win32.extname(Buffer.from('file.ext\\')), Buffer.from('.ext'));
            assert.deepEqual(path.win32.extname(Buffer.from('file.ext\\\\')), Buffer.from('.ext'));
            assert.deepEqual(path.win32.extname(Buffer.from('file\\')), Buffer.from(''));
            assert.deepEqual(path.win32.extname(Buffer.from('file\\\\')), Buffer.from(''));
            assert.deepEqual(path.win32.extname(Buffer.from('file.\\')), Buffer.from('.'));
            assert.deepEqual(path.win32.extname(Buffer.from('file.\\\\')), Buffer.from('.'));

            // On *nix, backslash is a valid name component like any other character.
            assert.deepEqual(path.posix.extname(Buffer.from('.\\')), Buffer.from(''));
            assert.deepEqual(path.posix.extname(Buffer.from('..\\')), Buffer.from('.\\'));
            assert.deepEqual(path.posix.extname(Buffer.from('file.ext\\')), Buffer.from('.ext\\'));
            assert.deepEqual(path.posix.extname(Buffer.from('file.ext\\\\')), Buffer.from('.ext\\\\'));
            assert.deepEqual(path.posix.extname(Buffer.from('file\\')), Buffer.from(''));
            assert.deepEqual(path.posix.extname(Buffer.from('file\\\\')), Buffer.from(''));
            assert.deepEqual(path.posix.extname(Buffer.from('file.\\')), Buffer.from('.\\'));
            assert.deepEqual(path.posix.extname(Buffer.from('file.\\\\')), Buffer.from('.\\\\'));
        });
    });
});

describe('isabsolute', function () {
    describe('string', function () {
        it('should return isabsolute', function () {
            assert.strictEqual(path.win32.isAbsolute('/'), true);
            assert.strictEqual(path.win32.isAbsolute('//'), true);
            assert.strictEqual(path.win32.isAbsolute('//server'), true);
            assert.strictEqual(path.win32.isAbsolute('//server/file'), true);
            assert.strictEqual(path.win32.isAbsolute('\\\\server\\file'), true);
            assert.strictEqual(path.win32.isAbsolute('\\\\server'), true);
            assert.strictEqual(path.win32.isAbsolute('\\\\'), true);
            assert.strictEqual(path.win32.isAbsolute('c'), false);
            assert.strictEqual(path.win32.isAbsolute('c:'), false);
            assert.strictEqual(path.win32.isAbsolute('c:\\'), true);
            assert.strictEqual(path.win32.isAbsolute('c:/'), true);
            assert.strictEqual(path.win32.isAbsolute('c://'), true);
            assert.strictEqual(path.win32.isAbsolute('C:/Users/'), true);
            assert.strictEqual(path.win32.isAbsolute('C:\\Users\\'), true);
            assert.strictEqual(path.win32.isAbsolute('C:cwd/another'), false);
            assert.strictEqual(path.win32.isAbsolute('C:cwd\\another'), false);
            assert.strictEqual(path.win32.isAbsolute('directory/directory'), false);
            assert.strictEqual(path.win32.isAbsolute('directory\\directory'), false);

            assert.strictEqual(path.posix.isAbsolute('/home/foo'), true);
            assert.strictEqual(path.posix.isAbsolute('/home/foo/..'), true);
            assert.strictEqual(path.posix.isAbsolute('bar/'), false);
            assert.strictEqual(path.posix.isAbsolute('./baz'), false);
        });
    });

    describe('buffer', function () {
        it('should return isabsolute', function () {
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('/')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('//')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('//server')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('//server/file')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('\\\\server\\file')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('\\\\server')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('\\\\')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('c')),false);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('c:')),false);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('c:\\')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('c:/')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('c://')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('C:/Users/')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('C:\\Users\\')),true);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('C:cwd/another')),false);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('C:cwd\\another')),false);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('directory/directory')),false);
            assert.strictEqual(path.win32.isAbsolute(Buffer.from('directory\\directory')),false);

            assert.strictEqual(path.posix.isAbsolute(Buffer.from('/home/foo')),true);
            assert.strictEqual(path.posix.isAbsolute(Buffer.from('/home/foo/..')),true);
            assert.strictEqual(path.posix.isAbsolute(Buffer.from('bar/')),false);
            assert.strictEqual(path.posix.isAbsolute(Buffer.from('./baz')),false);
        });
    });
});

describe('join', function () {
    describe('string', function () {
        it('should return join', function () {
            const failures = [];
            const backslashRE = /\\/g;

            const joinTests = [
                [ [path.posix.join, path.win32.join],
                    // Arguments                     result
                    [[['.', 'x/b', '..', '/b/c.js'], 'x/b/c.js'],
                        [[], '.'],
                        [['/.', 'x/b', '..', '/b/c.js'], '/x/b/c.js'],
                        [['/foo', '../../../bar'], '/bar'],
                        [['foo', '../../../bar'], '../../bar'],
                        [['foo/', '../../../bar'], '../../bar'],
                        [['foo/x', '../../../bar'], '../bar'],
                        [['foo/x', './bar'], 'foo/x/bar'],
                        [['foo/x/', './bar'], 'foo/x/bar'],
                        [['foo/x/', '.', 'bar'], 'foo/x/bar'],
                        [['./'], './'],
                        [['.', './'], './'],
                        [['.', '.', '.'], '.'],
                        [['.', './', '.'], '.'],
                        [['.', '/./', '.'], '.'],
                        [['.', '/////./', '.'], '.'],
                        [['.'], '.'],
                        [['', '.'], '.'],
                        [['', 'foo'], 'foo'],
                        [['foo', '/bar'], 'foo/bar'],
                        [['', '/foo'], '/foo'],
                        [['', '', '/foo'], '/foo'],
                        [['', '', 'foo'], 'foo'],
                        [['foo', ''], 'foo'],
                        [['foo/', ''], 'foo/'],
                        [['foo', '', '/bar'], 'foo/bar'],
                        [['./', '..', '/foo'], '../foo'],
                        [['./', '..', '..', '/foo'], '../../foo'],
                        [['.', '..', '..', '/foo'], '../../foo'],
                        [['', '..', '..', '/foo'], '../../foo'],
                        [['/'], '/'],
                        [['/', '.'], '/'],
                        [['/', '..'], '/'],
                        [['/', '..', '..'], '/'],
                        [[''], '.'],
                        [['', ''], '.'],
                        [[' /foo'], ' /foo'],
                        [[' ', 'foo'], ' /foo'],
                        [[' ', '.'], ' '],
                        [[' ', '/'], ' /'],
                        [[' ', ''], ' '],
                        [['/', 'foo'], '/foo'],
                        [['/', '/foo'], '/foo'],
                        [['/', '//foo'], '/foo'],
                        [['/', '', '/foo'], '/foo'],
                        [['', '/', 'foo'], '/foo'],
                        [['', '/', '/foo'], '/foo'],
                    ],
                ],
            ];

            // Windows-specific join tests
            joinTests.push([
                path.win32.join,
                joinTests[0][1].slice(0).concat(
                    [// Arguments                     result
                        // UNC path expected
                        [['//foo/bar'], '\\\\foo\\bar\\'],
                        [['\\/foo/bar'], '\\\\foo\\bar\\'],
                        [['\\\\foo/bar'], '\\\\foo\\bar\\'],
                        // UNC path expected - server and share separate
                        [['//foo', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo/', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo', '/bar'], '\\\\foo\\bar\\'],
                        // UNC path expected - questionable
                        [['//foo', '', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo/', '', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo/', '', '/bar'], '\\\\foo\\bar\\'],
                        // UNC path expected - even more questionable
                        [['', '//foo', 'bar'], '\\\\foo\\bar\\'],
                        [['', '//foo/', 'bar'], '\\\\foo\\bar\\'],
                        [['', '//foo/', '/bar'], '\\\\foo\\bar\\'],
                        // No UNC path expected (no double slash in first component)
                        [['\\', 'foo/bar'], '\\foo\\bar'],
                        [['\\', '/foo/bar'], '\\foo\\bar'],
                        [['', '/', '/foo/bar'], '\\foo\\bar'],
                        // No UNC path expected (no non-slashes in first component -
                        // questionable)
                        [['//', 'foo/bar'], '\\foo\\bar'],
                        [['//', '/foo/bar'], '\\foo\\bar'],
                        [['\\\\', '/', '/foo/bar'], '\\foo\\bar'],
                        [['//'], '\\'],
                        // No UNC path expected (share name missing - questionable).
                        [['//foo'], '\\foo'],
                        [['//foo/'], '\\foo\\'],
                        [['//foo', '/'], '\\foo\\'],
                        [['//foo', '', '/'], '\\foo\\'],
                        // No UNC path expected (too many leading slashes - questionable)
                        [['///foo/bar'], '\\foo\\bar'],
                        [['////foo', 'bar'], '\\foo\\bar'],
                        [['\\\\\\/foo/bar'], '\\foo\\bar'],
                        // Drive-relative vs drive-absolute paths. This merely describes the
                        // status quo, rather than being obviously right
                        [['c:'], 'c:.'],
                        [['c:.'], 'c:.'],
                        [['c:', ''], 'c:.'],
                        [['', 'c:'], 'c:.'],
                        [['c:.', '/'], 'c:.\\'],
                        [['c:.', 'file'], 'c:file'],
                        [['c:', '/'], 'c:\\'],
                        [['c:', 'file'], 'c:\\file'],
                    ]
                ),
            ]);
            joinTests.forEach((test) => {
                if (!Array.isArray(test[0]))
                    test[0] = [test[0]];
                test[0].forEach((join) => {
                    test[1].forEach((test) => {
                        const actual = join.apply(null, test[0]);
                        const expected = test[1];
                        // For non-Windows specific tests with the Windows join(), we need to try
                        // replacing the slashes since the non-Windows specific tests' `expected`
                        // use forward slashes
                        let actualAlt;
                        let os;
                        if (join === path.win32.join) {
                            actualAlt = actual.replace(backslashRE, '/');
                            os = 'win32';
                        } else {
                            os = 'posix';
                        }
                        if (actual !== expected && actualAlt !== expected) {
                            const delimiter = test[0].map(JSON.stringify).join(',');
                            const message = `path.${os}.join(${delimiter})\n  expect=${
                                JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                            failures.push(`\n${message}`);
                        }
                    });
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
    });

    describe('buffer', function () {
        it('should return join', function () {
            const failures = [];
            const backslashRE = /\\/g;

            const joinTests = [
                [ [path.posix.join, path.win32.join],
                    // Arguments                     result
                    [[['.', 'x/b', '..', '/b/c.js'], 'x/b/c.js'],
                        [[], '.'],
                        [['/.', 'x/b', '..', '/b/c.js'], '/x/b/c.js'],
                        [['/foo', '../../../bar'], '/bar'],
                        [['foo', '../../../bar'], '../../bar'],
                        [['foo/', '../../../bar'], '../../bar'],
                        [['foo/x', '../../../bar'], '../bar'],
                        [['foo/x', './bar'], 'foo/x/bar'],
                        [['foo/x/', './bar'], 'foo/x/bar'],
                        [['foo/x/', '.', 'bar'], 'foo/x/bar'],
                        [['./'], './'],
                        [['.', './'], './'],
                        [['.', '.', '.'], '.'],
                        [['.', './', '.'], '.'],
                        [['.', '/./', '.'], '.'],
                        [['.', '/////./', '.'], '.'],
                        [['.'], '.'],
                        [['', '.'], '.'],
                        [['', 'foo'], 'foo'],
                        [['foo', '/bar'], 'foo/bar'],
                        [['', '/foo'], '/foo'],
                        [['', '', '/foo'], '/foo'],
                        [['', '', 'foo'], 'foo'],
                        [['foo', ''], 'foo'],
                        [['foo/', ''], 'foo/'],
                        [['foo', '', '/bar'], 'foo/bar'],
                        [['./', '..', '/foo'], '../foo'],
                        [['./', '..', '..', '/foo'], '../../foo'],
                        [['.', '..', '..', '/foo'], '../../foo'],
                        [['', '..', '..', '/foo'], '../../foo'],
                        [['/'], '/'],
                        [['/', '.'], '/'],
                        [['/', '..'], '/'],
                        [['/', '..', '..'], '/'],
                        [[''], '.'],
                        [['', ''], '.'],
                        [[' /foo'], ' /foo'],
                        [[' ', 'foo'], ' /foo'],
                        [[' ', '.'], ' '],
                        [[' ', '/'], ' /'],
                        [[' ', ''], ' '],
                        [['/', 'foo'], '/foo'],
                        [['/', '/foo'], '/foo'],
                        [['/', '//foo'], '/foo'],
                        [['/', '', '/foo'], '/foo'],
                        [['', '/', 'foo'], '/foo'],
                        [['', '/', '/foo'], '/foo'],
                    ],
                ],
            ];

            // Windows-specific join tests
            joinTests.push([
                path.win32.join,
                joinTests[0][1].slice(0).concat(
                    [// Arguments                     result
                        // UNC path expected
                        [['//foo/bar'], '\\\\foo\\bar\\'],
                        [['\\/foo/bar'], '\\\\foo\\bar\\'],
                        [['\\\\foo/bar'], '\\\\foo\\bar\\'],
                        // UNC path expected - server and share separate
                        [['//foo', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo/', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo', '/bar'], '\\\\foo\\bar\\'],
                        // UNC path expected - questionable
                        [['//foo', '', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo/', '', 'bar'], '\\\\foo\\bar\\'],
                        [['//foo/', '', '/bar'], '\\\\foo\\bar\\'],
                        // UNC path expected - even more questionable
                        [['', '//foo', 'bar'], '\\\\foo\\bar\\'],
                        [['', '//foo/', 'bar'], '\\\\foo\\bar\\'],
                        [['', '//foo/', '/bar'], '\\\\foo\\bar\\'],
                        // No UNC path expected (no double slash in first component)
                        [['\\', 'foo/bar'], '\\foo\\bar'],
                        [['\\', '/foo/bar'], '\\foo\\bar'],
                        [['', '/', '/foo/bar'], '\\foo\\bar'],
                        // No UNC path expected (no non-slashes in first component -
                        // questionable)
                        [['//', 'foo/bar'], '\\foo\\bar'],
                        [['//', '/foo/bar'], '\\foo\\bar'],
                        [['\\\\', '/', '/foo/bar'], '\\foo\\bar'],
                        [['//'], '\\'],
                        // No UNC path expected (share name missing - questionable).
                        [['//foo'], '\\foo'],
                        [['//foo/'], '\\foo\\'],
                        [['//foo', '/'], '\\foo\\'],
                        [['//foo', '', '/'], '\\foo\\'],
                        // No UNC path expected (too many leading slashes - questionable)
                        [['///foo/bar'], '\\foo\\bar'],
                        [['////foo', 'bar'], '\\foo\\bar'],
                        [['\\\\\\/foo/bar'], '\\foo\\bar'],
                        // Drive-relative vs drive-absolute paths. This merely describes the
                        // status quo, rather than being obviously right
                        [['c:'], 'c:.'],
                        [['c:.'], 'c:.'],
                        [['c:', ''], 'c:.'],
                        [['', 'c:'], 'c:.'],
                        [['c:.', '/'], 'c:.\\'],
                        [['c:.', 'file'], 'c:file'],
                        [['c:', '/'], 'c:\\'],
                        [['c:', 'file'], 'c:\\file'],
                    ]
                ),
            ]);
            joinTests.forEach((test) => {
                if (!Array.isArray(test[0]))
                    test[0] = [test[0]];
                test[0].forEach((join) => {
                    test[1].forEach((test) => {
                        const actual = join.apply(null, test[0].map((p) => Buffer.from(p))).toString();
                        const expected = test[1];
                        // For non-Windows specific tests with the Windows join(), we need to try
                        // replacing the slashes since the non-Windows specific tests' `expected`
                        // use forward slashes
                        let actualAlt;
                        let os;
                        if (join === path.win32.join) {
                            actualAlt = actual.replace(backslashRE, '/');
                            os = 'win32';
                        } else {
                            os = 'posix';
                        }
                        if (actual !== expected && actualAlt !== expected) {
                            const delimiter = test[0].map(JSON.stringify).join(',');
                            const message = `path.${os}.join(${delimiter})\n  expect=${
                                JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                            failures.push(`\n${message}`);
                        }
                    });
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
    });
});

describe('normalize', function () {
    describe('string', function () {
        it('should return normalize', function () {
            assert.strictEqual(path.win32.normalize('./fixtures///b/../b/c.js'),
                'fixtures\\b\\c.js');
            assert.strictEqual(path.win32.normalize('/foo/../../../bar'), '\\bar');
            assert.strictEqual(path.win32.normalize('a//b//../b'), 'a\\b');
            assert.strictEqual(path.win32.normalize('a//b//./c'), 'a\\b\\c');
            assert.strictEqual(path.win32.normalize('a//b//.'), 'a\\b');
            assert.strictEqual(path.win32.normalize('//server/share/dir/file.ext'),
                '\\\\server\\share\\dir\\file.ext');
            assert.strictEqual(path.win32.normalize('/a/b/c/../../../x/y/z'), '\\x\\y\\z');
            assert.strictEqual(path.win32.normalize('C:'), 'C:.');
            assert.strictEqual(path.win32.normalize('C:..\\abc'), 'C:..\\abc');
            assert.strictEqual(path.win32.normalize('C:..\\..\\abc\\..\\def'),
                'C:..\\..\\def');
            assert.strictEqual(path.win32.normalize('C:\\.'), 'C:\\');
            assert.strictEqual(path.win32.normalize('file:stream'), 'file:stream');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\..\\'), 'bar\\');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\..'), 'bar');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\..\\baz'), 'bar\\baz');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\'), 'bar\\foo..\\');
            assert.strictEqual(path.win32.normalize('bar\\foo..'), 'bar\\foo..');
            assert.strictEqual(path.win32.normalize('..\\foo..\\..\\..\\bar'),
                '..\\..\\bar');
            assert.strictEqual(path.win32.normalize('..\\...\\..\\.\\...\\..\\..\\bar'),
                '..\\..\\bar');
            assert.strictEqual(path.win32.normalize('../../../foo/../../../bar'),
                '..\\..\\..\\..\\..\\bar');
            assert.strictEqual(path.win32.normalize('../../../foo/../../../bar/../../'),
                '..\\..\\..\\..\\..\\..\\');
            assert.strictEqual(
                path.win32.normalize('../foobar/barfoo/foo/../../../bar/../../'),
                '..\\..\\'
            );
            assert.strictEqual(
                path.win32.normalize('../.../../foobar/../../../bar/../../baz'),
                '..\\..\\..\\..\\baz'
            );
            assert.strictEqual(path.win32.normalize('foo/bar\\baz'), 'foo\\bar\\baz');

            assert.strictEqual(path.posix.normalize('./fixtures///b/../b/c.js'),
                'fixtures/b/c.js');
            assert.strictEqual(path.posix.normalize('/foo/../../../bar'), '/bar');
            assert.strictEqual(path.posix.normalize('a//b//../b'), 'a/b');
            assert.strictEqual(path.posix.normalize('a//b//./c'), 'a/b/c');
            assert.strictEqual(path.posix.normalize('a//b//.'), 'a/b');
            assert.strictEqual(path.posix.normalize('/a/b/c/../../../x/y/z'), '/x/y/z');
            assert.strictEqual(path.posix.normalize('///..//./foo/.//bar'), '/foo/bar');
            assert.strictEqual(path.posix.normalize('bar/foo../../'), 'bar/');
            assert.strictEqual(path.posix.normalize('bar/foo../..'), 'bar');
            assert.strictEqual(path.posix.normalize('bar/foo../../baz'), 'bar/baz');
            assert.strictEqual(path.posix.normalize('bar/foo../'), 'bar/foo../');
            assert.strictEqual(path.posix.normalize('bar/foo..'), 'bar/foo..');
            assert.strictEqual(path.posix.normalize('../foo../../../bar'), '../../bar');
            assert.strictEqual(path.posix.normalize('../.../.././.../../../bar'),
                '../../bar');
            assert.strictEqual(path.posix.normalize('../../../foo/../../../bar'),
                '../../../../../bar');
            assert.strictEqual(path.posix.normalize('../../../foo/../../../bar/../../'),
                '../../../../../../');
            assert.strictEqual(
                path.posix.normalize('../foobar/barfoo/foo/../../../bar/../../'),
                '../../'
            );
            assert.strictEqual(
                path.posix.normalize('../.../../foobar/../../../bar/../../baz'),
                '../../../../baz'
            );
            assert.strictEqual(path.posix.normalize('foo/bar\\baz'), 'foo/bar\\baz');
        });
    });

    describe('buffer', function () {
        it('should return normalize', function () {
            assert.deepEqual(path.win32.normalize(Buffer.from('./fixtures///b/../b/c.js')), Buffer.from('fixtures\\b\\c.js'));
            assert.deepEqual(path.win32.normalize(Buffer.from('/foo/../../../bar')), Buffer.from('\\bar'));
            assert.deepEqual(path.win32.normalize(Buffer.from('a//b//../b')), Buffer.from('a\\b'));
            assert.deepEqual(path.win32.normalize(Buffer.from('a//b//./c')), Buffer.from('a\\b\\c'));
            assert.deepEqual(path.win32.normalize(Buffer.from('a//b//.')), Buffer.from('a\\b'));
            assert.deepEqual(path.win32.normalize(Buffer.from('//server/share/dir/file.ext')), Buffer.from('\\\\server\\share\\dir\\file.ext'));
            assert.deepEqual(path.win32.normalize(Buffer.from('/a/b/c/../../../x/y/z')), Buffer.from('\\x\\y\\z'));
            assert.deepEqual(path.win32.normalize(Buffer.from('C:')), Buffer.from('C:.'));
            assert.deepEqual(path.win32.normalize(Buffer.from('C:..\\abc')), Buffer.from('C:..\\abc'));
            assert.deepEqual(path.win32.normalize(Buffer.from('C:..\\..\\abc\\..\\def')), Buffer.from('C:..\\..\\def'));
            assert.deepEqual(path.win32.normalize(Buffer.from('C:\\.')), Buffer.from('C:\\'));
            assert.deepEqual(path.win32.normalize(Buffer.from('file:stream')), Buffer.from('file:stream'));
            assert.deepEqual(path.win32.normalize(Buffer.from('bar\\foo..\\..\\')), Buffer.from('bar\\'));
            assert.deepEqual(path.win32.normalize(Buffer.from('bar\\foo..\\..')), Buffer.from('bar'));
            assert.deepEqual(path.win32.normalize(Buffer.from('bar\\foo..\\..\\baz')), Buffer.from('bar\\baz'));
            assert.deepEqual(path.win32.normalize(Buffer.from('bar\\foo..\\')), Buffer.from('bar\\foo..\\'));
            assert.deepEqual(path.win32.normalize(Buffer.from('bar\\foo..')), Buffer.from('bar\\foo..'));
            assert.deepEqual(path.win32.normalize(Buffer.from('..\\foo..\\..\\..\\bar')), Buffer.from('..\\..\\bar'));
            assert.deepEqual(path.win32.normalize(Buffer.from('..\\...\\..\\.\\...\\..\\..\\bar')), Buffer.from('..\\..\\bar'));
            assert.deepEqual(path.win32.normalize(Buffer.from('../../../foo/../../../bar')), Buffer.from('..\\..\\..\\..\\..\\bar'));
            assert.deepEqual(path.win32.normalize(Buffer.from('../../../foo/../../../bar/../../')), Buffer.from('..\\..\\..\\..\\..\\..\\'));
            assert.deepEqual(path.win32.normalize(Buffer.from('../foobar/barfoo/foo/../../../bar/../../')), Buffer.from('..\\..\\'));
            assert.deepEqual(path.win32.normalize(Buffer.from('../.../../foobar/../../../bar/../../baz')), Buffer.from('..\\..\\..\\..\\baz'));
            assert.deepEqual(path.win32.normalize(Buffer.from('foo/bar\\baz')), Buffer.from('foo\\bar\\baz'));

            assert.deepEqual(path.posix.normalize(Buffer.from('./fixtures///b/../b/c.js')), Buffer.from('fixtures/b/c.js'));
            assert.deepEqual(path.posix.normalize(Buffer.from('/foo/../../../bar')), Buffer.from('/bar'));
            assert.deepEqual(path.posix.normalize(Buffer.from('a//b//../b')), Buffer.from('a/b'));
            assert.deepEqual(path.posix.normalize(Buffer.from('a//b//./c')), Buffer.from('a/b/c'));
            assert.deepEqual(path.posix.normalize(Buffer.from('a//b//.')), Buffer.from('a/b'));
            assert.deepEqual(path.posix.normalize(Buffer.from('/a/b/c/../../../x/y/z')), Buffer.from('/x/y/z'));
            assert.deepEqual(path.posix.normalize(Buffer.from('///..//./foo/.//bar')), Buffer.from('/foo/bar'));
            assert.deepEqual(path.posix.normalize(Buffer.from('bar/foo../../')), Buffer.from('bar/'));
            assert.deepEqual(path.posix.normalize(Buffer.from('bar/foo../..')), Buffer.from('bar'));
            assert.deepEqual(path.posix.normalize(Buffer.from('bar/foo../../baz')), Buffer.from('bar/baz'));
            assert.deepEqual(path.posix.normalize(Buffer.from('bar/foo../')), Buffer.from('bar/foo../'));
            assert.deepEqual(path.posix.normalize(Buffer.from('bar/foo..')), Buffer.from('bar/foo..'));
            assert.deepEqual(path.posix.normalize(Buffer.from('../foo../../../bar')), Buffer.from('../../bar'));
            assert.deepEqual(path.posix.normalize(Buffer.from('../.../.././.../../../bar')), Buffer.from('../../bar'));
            assert.deepEqual(path.posix.normalize(Buffer.from('../../../foo/../../../bar')), Buffer.from('../../../../../bar'));
            assert.deepEqual(path.posix.normalize(Buffer.from('../../../foo/../../../bar/../../')), Buffer.from('../../../../../../'));
            assert.deepEqual(path.posix.normalize(Buffer.from('../foobar/barfoo/foo/../../../bar/../../')), Buffer.from('../../'));
            assert.deepEqual(path.posix.normalize(Buffer.from('../.../../foobar/../../../bar/../../baz')), Buffer.from('../../../../baz'));
            assert.deepEqual(path.posix.normalize(Buffer.from('foo/bar\\baz')), Buffer.from('foo/bar\\baz'));
        });
    });
});

describe('relative', function () {
    describe('string', function () {
        it('should return relative', function () {
            const failures = [];

            const relativeTests = [
                [ path.win32.relative,
                    // Arguments                     result
                    [['c:/blah\\blah', 'd:/games', 'd:\\games'],
                        ['c:/aaaa/bbbb', 'c:/aaaa', '..'],
                        ['c:/aaaa/bbbb', 'c:/cccc', '..\\..\\cccc'],
                        ['c:/aaaa/bbbb', 'c:/aaaa/bbbb', ''],
                        ['c:/aaaa/bbbb', 'c:/aaaa/cccc', '..\\cccc'],
                        ['c:/aaaa/', 'c:/aaaa/cccc', 'cccc'],
                        ['c:/', 'c:\\aaaa\\bbbb', 'aaaa\\bbbb'],
                        ['c:/aaaa/bbbb', 'd:\\', 'd:\\'],
                        ['c:/AaAa/bbbb', 'c:/aaaa/bbbb', ''],
                        ['c:/aaaaa/', 'c:/aaaa/cccc', '..\\aaaa\\cccc'],
                        ['C:\\foo\\bar\\baz\\quux', 'C:\\', '..\\..\\..\\..'],
                        ['C:\\foo\\test', 'C:\\foo\\test\\bar\\package.json', 'bar\\package.json'],
                        ['C:\\foo\\bar\\baz-quux', 'C:\\foo\\bar\\baz', '..\\baz'],
                        ['C:\\foo\\bar\\baz', 'C:\\foo\\bar\\baz-quux', '..\\baz-quux'],
                        ['\\\\foo\\bar', '\\\\foo\\bar\\baz', 'baz'],
                        ['\\\\foo\\bar\\baz', '\\\\foo\\bar', '..'],
                        ['\\\\foo\\bar\\baz-quux', '\\\\foo\\bar\\baz', '..\\baz'],
                        ['\\\\foo\\bar\\baz', '\\\\foo\\bar\\baz-quux', '..\\baz-quux'],
                        ['C:\\baz-quux', 'C:\\baz', '..\\baz'],
                        ['C:\\baz', 'C:\\baz-quux', '..\\baz-quux'],
                        ['\\\\foo\\baz-quux', '\\\\foo\\baz', '..\\baz'],
                        ['\\\\foo\\baz', '\\\\foo\\baz-quux', '..\\baz-quux'],
                        ['C:\\baz', '\\\\foo\\bar\\baz', '\\\\foo\\bar\\baz'],
                        ['\\\\foo\\bar\\baz', 'C:\\baz', 'C:\\baz'],
                    ],
                ],
                [ path.posix.relative,
                    // Arguments          result
                    [['/var/lib', '/var', '..'],
                        ['/var/lib', '/bin', '../../bin'],
                        ['/var/lib', '/var/lib', ''],
                        ['/var/lib', '/var/apache', '../apache'],
                        ['/var/', '/var/lib', 'lib'],
                        ['/', '/var/lib', 'var/lib'],
                        ['/foo/test', '/foo/test/bar/package.json', 'bar/package.json'],
                        ['/Users/a/web/b/test/mails', '/Users/a/web/b', '../..'],
                        ['/foo/bar/baz-quux', '/foo/bar/baz', '../baz'],
                        ['/foo/bar/baz', '/foo/bar/baz-quux', '../baz-quux'],
                        ['/baz-quux', '/baz', '../baz'],
                        ['/baz', '/baz-quux', '../baz-quux'],
                        ['/page1/page2/foo', '/', '../../..'],
                    ],
                ],
            ];
            relativeTests.forEach((test) => {
                const relative = test[0];
                test[1].forEach((test) => {
                    const actual = relative(test[0], test[1]);
                    const expected = test[2];
                    if (actual !== expected) {
                        const os = relative === path.win32.relative ? 'win32' : 'posix';
                        const message = `path.${os}.relative(${
                            test.slice(0, 2).map(JSON.stringify).join(',')})\n  expect=${
                            JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                        failures.push(`\n${message}`);
                    }
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
    });

    describe('buffer', function () {
        it('should return relative', function () {
            const failures = [];

            const relativeTests = [
                [ path.win32.relative,
                    // Arguments                     result
                    [['c:/blah\\blah', 'd:/games', 'd:\\games'],
                        ['c:/aaaa/bbbb', 'c:/aaaa', '..'],
                        ['c:/aaaa/bbbb', 'c:/cccc', '..\\..\\cccc'],
                        ['c:/aaaa/bbbb', 'c:/aaaa/bbbb', ''],
                        ['c:/aaaa/bbbb', 'c:/aaaa/cccc', '..\\cccc'],
                        ['c:/aaaa/', 'c:/aaaa/cccc', 'cccc'],
                        ['c:/', 'c:\\aaaa\\bbbb', 'aaaa\\bbbb'],
                        ['c:/aaaa/bbbb', 'd:\\', 'd:\\'],
                        ['c:/AaAa/bbbb', 'c:/aaaa/bbbb', ''],
                        ['c:/aaaaa/', 'c:/aaaa/cccc', '..\\aaaa\\cccc'],
                        ['C:\\foo\\bar\\baz\\quux', 'C:\\', '..\\..\\..\\..'],
                        ['C:\\foo\\test', 'C:\\foo\\test\\bar\\package.json', 'bar\\package.json'],
                        ['C:\\foo\\bar\\baz-quux', 'C:\\foo\\bar\\baz', '..\\baz'],
                        ['C:\\foo\\bar\\baz', 'C:\\foo\\bar\\baz-quux', '..\\baz-quux'],
                        ['\\\\foo\\bar', '\\\\foo\\bar\\baz', 'baz'],
                        ['\\\\foo\\bar\\baz', '\\\\foo\\bar', '..'],
                        ['\\\\foo\\bar\\baz-quux', '\\\\foo\\bar\\baz', '..\\baz'],
                        ['\\\\foo\\bar\\baz', '\\\\foo\\bar\\baz-quux', '..\\baz-quux'],
                        ['C:\\baz-quux', 'C:\\baz', '..\\baz'],
                        ['C:\\baz', 'C:\\baz-quux', '..\\baz-quux'],
                        ['\\\\foo\\baz-quux', '\\\\foo\\baz', '..\\baz'],
                        ['\\\\foo\\baz', '\\\\foo\\baz-quux', '..\\baz-quux'],
                        ['C:\\baz', '\\\\foo\\bar\\baz', '\\\\foo\\bar\\baz'],
                        ['\\\\foo\\bar\\baz', 'C:\\baz', 'C:\\baz'],
                    ],
                ],
                [ path.posix.relative,
                    // Arguments          result
                    [['/var/lib', '/var', '..'],
                        ['/var/lib', '/bin', '../../bin'],
                        ['/var/lib', '/var/lib', ''],
                        ['/var/lib', '/var/apache', '../apache'],
                        ['/var/', '/var/lib', 'lib'],
                        ['/', '/var/lib', 'var/lib'],
                        ['/foo/test', '/foo/test/bar/package.json', 'bar/package.json'],
                        ['/Users/a/web/b/test/mails', '/Users/a/web/b', '../..'],
                        ['/foo/bar/baz-quux', '/foo/bar/baz', '../baz'],
                        ['/foo/bar/baz', '/foo/bar/baz-quux', '../baz-quux'],
                        ['/baz-quux', '/baz', '../baz'],
                        ['/baz', '/baz-quux', '../baz-quux'],
                        ['/page1/page2/foo', '/', '../../..'],
                    ],
                ],
            ];
            relativeTests.forEach((test) => {
                const relative = test[0];
                test[1].forEach((test) => {
                    const actual = relative(Buffer.from(test[0]), Buffer.from(test[1])).toString();
                    const expected = test[2];
                    if (actual !== expected) {
                        const os = relative === path.win32.relative ? 'win32' : 'posix';
                        const message = `path.${os}.relative(${
                            test.slice(0, 2).map(JSON.stringify).join(',')})\n  expect=${
                            JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                        failures.push(`\n${message}`);
                    }
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
    });
});

describe('resolve', function () {
    describe('string', function () {
        it('should return resolve', function () {
            const failures = [];
            const slashRE = /\//g;
            const backslashRE = /\\/g;

            const posixyCwd = process.platform === 'win32' ?
                (() => {
                    const _ = process.cwd()
                        .replaceAll(path.sep, path.posix.sep);
                    return _.slice(_.indexOf(path.posix.sep));
                })() :
                process.cwd();

            const resolveTests = [
                [ path.win32.resolve,
                    // Arguments                               result
                    [[['c:/blah\\blah', 'd:/games', 'c:../a'], 'c:\\blah\\a'],
                        [['c:/ignore', 'd:\\a/b\\c/d', '\\e.exe'], 'd:\\e.exe'],
                        [['c:/ignore', 'c:/some/file'], 'c:\\some\\file'],
                        [['d:/ignore', 'd:some/dir//'], 'd:\\ignore\\some\\dir'],
                        [['.'], process.cwd()],
                        [['//server/share', '..', 'relative\\'], '\\\\server\\share\\relative'],
                        [['c:/', '//'], 'c:\\'],
                        [['c:/', '//dir'], 'c:\\dir'],
                        [['c:/', '//server/share'], '\\\\server\\share\\'],
                        [['c:/', '//server//share'], '\\\\server\\share\\'],
                        [['c:/', '///some//dir'], 'c:\\some\\dir'],
                        [['C:\\foo\\tmp.3\\', '..\\tmp.3\\cycles\\root.js'],
                            'C:\\foo\\tmp.3\\cycles\\root.js'],
                    ],
                ],
                [ path.posix.resolve,
                    // Arguments                    result
                    [[['/var/lib', '../', 'file/'], '/var/file'],
                        [['/var/lib', '/../', 'file/'], '/file'],
                        [['a/b/c/', '../../..'], posixyCwd],
                        [['.'], posixyCwd],
                        [['/some/dir', '.', '/absolute/'], '/absolute'],
                        [['/foo/tmp.3/', '../tmp.3/cycles/root.js'], '/foo/tmp.3/cycles/root.js'],
                    ],
                ],
            ];
            resolveTests.forEach(([resolve, tests]) => {
                tests.forEach(([test, expected]) => {
                    const actual = resolve.apply(null, test);
                    let actualAlt;
                    const os = resolve === path.win32.resolve ? 'win32' : 'posix';
                    if (resolve === path.win32.resolve && process.platform !== 'win32')
                        actualAlt = actual.replace(backslashRE, '/');
                    else if (resolve !== path.win32.resolve && process.platform === 'win32')
                        actualAlt = actual.replace(slashRE, '\\');

                    const message =
                        `path.${os}.resolve(${test.map(JSON.stringify).join(',')})\n  expect=${
                            JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected && actualAlt !== expected)
                        failures.push(message);
                });
            });
            assert.strictEqual(failures.length, 0, failures.join('\n'));
        });
    });

    describe('buffer', function () {
        it('should return resolve', function () {
            const failures = [];
            const slashRE = /\//g;
            const backslashRE = /\\/g;

            const posixyCwd = process.platform === 'win32' ?
                (() => {
                    const _ = process.cwd()
                        .replaceAll(path.sep, path.posix.sep);
                    return _.slice(_.indexOf(path.posix.sep));
                })() :
                process.cwd();

            const resolveTests = [
                [ path.win32.resolve,
                    // Arguments                               result
                    [[['c:/blah\\blah', 'd:/games', 'c:../a'], 'c:\\blah\\a'],
                        [['c:/ignore', 'd:\\a/b\\c/d', '\\e.exe'], 'd:\\e.exe'],
                        [['c:/ignore', 'c:/some/file'], 'c:\\some\\file'],
                        [['d:/ignore', 'd:some/dir//'], 'd:\\ignore\\some\\dir'],
                        [['.'], process.cwd()],
                        [['//server/share', '..', 'relative\\'], '\\\\server\\share\\relative'],
                        [['c:/', '//'], 'c:\\'],
                        [['c:/', '//dir'], 'c:\\dir'],
                        [['c:/', '//server/share'], '\\\\server\\share\\'],
                        [['c:/', '//server//share'], '\\\\server\\share\\'],
                        [['c:/', '///some//dir'], 'c:\\some\\dir'],
                        [['C:\\foo\\tmp.3\\', '..\\tmp.3\\cycles\\root.js'],
                            'C:\\foo\\tmp.3\\cycles\\root.js'],
                    ],
                ],
                [ path.posix.resolve,
                    // Arguments                    result
                    [[['/var/lib', '../', 'file/'], '/var/file'],
                        [['/var/lib', '/../', 'file/'], '/file'],
                        [['a/b/c/', '../../..'], posixyCwd],
                        [['.'], posixyCwd],
                        [['/some/dir', '.', '/absolute/'], '/absolute'],
                        [['/foo/tmp.3/', '../tmp.3/cycles/root.js'], '/foo/tmp.3/cycles/root.js'],
                    ],
                ],
            ];
            resolveTests.forEach(([resolve, tests]) => {
                tests.forEach(([test, expected]) => {
                    const actual = resolve.apply(null, test.map((p) => Buffer.from(p))).toString();
                    let actualAlt;
                    const os = resolve === path.win32.resolve ? 'win32' : 'posix';
                    if (resolve === path.win32.resolve && process.platform !== 'win32')
                        actualAlt = actual.replace(backslashRE, '/');
                    else if (resolve !== path.win32.resolve && process.platform === 'win32')
                        actualAlt = actual.replace(slashRE, '\\');

                    const message =
                        `path.${os}.resolve(${test.map(JSON.stringify).join(',')})\n  expect=${
                            JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected && actualAlt !== expected)
                        failures.push(message);
                });
            });
            assert.strictEqual(failures.length, 0, failures.join('\n'));
        });
    });
});
