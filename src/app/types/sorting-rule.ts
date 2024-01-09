export type RawSubSortingRule = {
    _type: 'RawSubSortingRule';
    label: string;
    regex: string;
    order: number;
    regexFlags?: string[];
};

/** The model for values provided in settings.json */
export type RawSortingRule = {
    _type: 'RawSortingRule';
    label: string;
    regex: string;
    order: number;
    regexFlags?: string[];
    subgroupSortingRules?: RawSubSortingRule[];
};

export type SubSortingRule = {
    _type: 'SubSortingRule';
    label: string;
    regex: RegExp;
    order: number;
};

/** The model that the sorting algorithm uses */
export type SortingRule = {
    _type: 'SortingRule';
    label: string;
    regex: RegExp;
    order: number;
    subgroupSortingRules?: SubSortingRule[];
};
