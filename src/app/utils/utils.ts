export class Utils {
    static isDartFilename(filename?: string): boolean {
        if (!filename) {
            return false;
        }

        return filename.slice(-5) === '.dart';
    }

    static removeNewLines(str: string) {
        return str.replace(/(\r\n|\n|\r)/gm, '');
    }

    static removeSpaces(str: string): string {
        return str.split(' ').join('');
    }
}
