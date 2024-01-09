export type ReplaceRangeInFileOptions = {
    from: number;
    to: number;
    replacement: string;
};

export interface IFileInteractor {
    read(filepath: string): string;
    replace(options: ReplaceRangeInFileOptions): void;
}
