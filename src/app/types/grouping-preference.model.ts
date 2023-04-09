export type RawSubgroupingPreference = {
    _type: 'RawSubgroupingPreference';
    label: string;
    regex: string;
    order: number;
    regexFlags: string[];
};

/** The model for values provided in settings.json */
export type RawGroupingPreference = {
    _type: 'RawGroupingPreference';
    label: string;
    regex: string;
    order: number;
    regexFlags: string[];
    rawSubgroupSortingRules?: RawSubgroupingPreference[];
};

export interface SubgroupingPreference {
    _type: 'SubgroupingPreference';
    label: string;
    regex: RegExp;
    order: number;
}

/** The model that the sorting algorithm uses */
export interface GroupingPreference {
    _type: 'GroupingPreference';
    label: string;
    regex: RegExp;
    order: number;
    subgroupSortingRules?: SubgroupingPreference[];
}
