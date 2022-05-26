/** The model for values provided in settings.json */
export type RawGroupingPreference = {
    label: string;
    regex: string;
    order: number;
    regexFlags: string[];
};

/** The model that the sorting algorithm uses */
export type GroupingPreference = {
    regex: RegExp;
    order: number;
};
