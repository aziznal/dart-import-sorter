import { GroupingPreference } from '../types/grouping-preference.model';

export interface IExtensionSettings {
    get leaveEmptyLinesBetweenImports(): boolean;

    get sortingRules(): GroupingPreference[];

    get sortOnSaveEnabled(): boolean;

    get projectName(): string;
}
