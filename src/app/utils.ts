import { CouldNotReadDocumentError } from './errors/could-not-read-document.error';

export class Utils {
    static isDartFilename(filename?: string): boolean {
        if (!filename) {
            return false;
        }

        return filename.slice(-5) === '.dart';
    }

    static splitIntoStringArray(bodyOfText: string): string[] {
        const lines = bodyOfText
            .split('\n')
            .map((statement) => statement.replace(/(\r\n|\n|\r)/gm, ''));

        if (lines === null || lines === undefined) {
            throw new CouldNotReadDocumentError('Undefined documentLines in top level method');
        }

        return lines;
    }
}
