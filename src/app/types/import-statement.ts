export class ImportStatement {
    constructor(public rawBody: string, public lineNumber: number) {}

    get path(): string {
        // first remove all comments
        const noComments = this.rawBody.replace(/\/\/.*$/gm, '');

        // find whatever's between single or double quotes after the first import keyword
        const match = noComments.match(/import\s+['"]([^'"]+)['"]/);

        return match ? match[1] : '';
    }
}
