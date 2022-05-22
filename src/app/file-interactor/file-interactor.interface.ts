export interface IFileInteractor {
    read(filepath: string): string;

    write(filepath: string): string;

    replace(filepath: string, from: number, to: number, withLines: string): void;
}
