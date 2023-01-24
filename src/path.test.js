'use strict';

const path = require('./path');

describe('basename', function () {
    describe('string', function () {
        it('should return basename', function () {
            expect(path.basename('/foo/bar/baz/asdf/quux.html')).toEqual('quux.html');
            expect(path.basename('/foo/bar/baz/asdf/quux.html', '.html')).toEqual('quux');
        });
    });
});
