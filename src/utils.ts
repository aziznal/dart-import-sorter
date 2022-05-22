import { GroupingPreference, RawGroupingPreference } from './types/grouping-preference.model';

export class Utils {
    static isDartFilename(filename?: string): boolean {
        if (!filename) {
            return false;
        }

        return filename.slice(-5) === '.dart';
    }

    static parseSortingRules(rawSortingRules: RawGroupingPreference[]): GroupingPreference[] {
        const formattedRules = rawSortingRules.map((rule) => {
            return {
                order: rule.order,
                regex: RegExp(rule.regex, rule.regexFlags.join('')),
            };
        });

        return formattedRules;
    }
}
