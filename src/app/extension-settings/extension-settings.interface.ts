import { SortingRule } from '../types/sorting-rule';

export interface IExtensionSettings {
    get leaveEmptyLinesBetweenImports(): boolean;

    get sortingRules(): SortingRule[];

    get sortOnSaveEnabled(): boolean;

    get projectName(): string;
}
