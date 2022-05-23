import { Utils } from './utils';

describe('', () => {
    test('should detect given filename as dart file', () => {
        expect(Utils.isDartFilename('testfile.dart')).toBe(true);
        expect(Utils.isDartFilename('.dart')).toBe(true);
    });

    test('should detect given filename as NOT dart file', () => {
        expect(Utils.isDartFilename('testfile.somethingelse')).toBe(false);
        expect(Utils.isDartFilename('somethingelse')).toBe(false);
        expect(Utils.isDartFilename('file.dart.py')).toBe(false);
        expect(Utils.isDartFilename('dart')).toBe(false);

        expect(Utils.isDartFilename('')).toBe(false);
        expect(Utils.isDartFilename()).toBe(false);
        expect(Utils.isDartFilename(undefined)).toBe(false);
        expect(Utils.isDartFilename(null as unknown as any)).toBe(false);
    });

    test('should remove new lines from given string', () => {
        expect(Utils.removeNewLines('this\nis\na\ntest\n')).toStrictEqual('thisisatest');
        expect(Utils.removeNewLines('this \nis \na \ntest \n')).toStrictEqual('this is a test ');
        expect(Utils.removeNewLines('\n\n\n')).toStrictEqual('');
        expect(Utils.removeNewLines('')).toStrictEqual('');
    });
});
