export type RawSubgroupingPreference = {
    label: string;
    regex: string;
    order: number;
    regexFlags: string[];
};

/** The model for values provided in settings.json */
export type RawGroupingPreference = {
    label: string;
    regex: string;
    order: number;
    regexFlags: string[];
    subgroupSortingRules?: RawSubgroupingPreference[];
};

export type SubgroupingPreference = {
    label: string;
    regex: string;
    order: number;
};

/** The model that the sorting algorithm uses */
export type GroupingPreference = {
    label: string;
    regex: RegExp;
    order: number;
    subgroupSortingRules?: SubgroupingPreference[];
};
