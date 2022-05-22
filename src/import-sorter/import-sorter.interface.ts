import { IExtensionSettings } from "../extension-settings/extension-settings.interface";

export interface IImportSorter {
    rawImports: string[];

    settings: IExtensionSettings;

    get firstRawImportIndex(): number;

    get lastRawImportIndex(): number;

    sortImports(): string;
}
