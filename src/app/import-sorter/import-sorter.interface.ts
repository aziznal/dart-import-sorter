import { IExtensionSettings } from '../extension-settings/extension-settings.interface';

export type SortingResult = {
    sortedImports: string;
    firstRawImportIndex: number;
    lastRawImportIndex: number;
};

export interface IImportSorter {
    settings: IExtensionSettings;

    sortImports(rawDocumentBody: string): SortingResult;
}
