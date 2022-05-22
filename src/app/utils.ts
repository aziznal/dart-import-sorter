import { CouldNotReadDocumentError } from './errors/could-not-read-document.error';

export class Utils {
    static isDartFilename(filename?: string): boolean {
        if (!filename) {
            return false;
        }

        return filename.slice(-5) === '.dart';
    }

    static splitIntoStringArray(bodyOfText: string): string[] {
        return bodyOfText.split('\n');
    }

    static removeNewLines(str: string) {
        return str.replace(/(\r\n|\n|\r)/gm, '');
    }
}
