import { injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { GroupingPreference, RawGroupingPreference } from '../types/grouping-preference.model';

import { IExtensionSettings } from './extension-settings.interface';

/**
 * Stores refs to all extension settings. Latest state is always returned since
 * everything is implemented in getters.
 */
@injectable()
export class ExtensionSettings implements IExtensionSettings {
    private get extensionConfig() {
        return vscode.workspace.getConfiguration('dartimportsorter');
    }

    get leaveEmptyLinesBetweenImports(): boolean {
        return this.extensionConfig.get('leaveEmptyLinesBetweenGroups') as boolean;
    }

    get sortingRules(): GroupingPreference[] {
        return this.getSortingRules();
    }

    get sortOnSaveEnabled(): boolean {
        return this.extensionConfig.get('sortOnSave') as boolean;
    }

    private getSortingRules() {
        const rawSortingRules = this.extensionConfig.get(
            'matchingRules'
        ) as RawGroupingPreference[];

        return this.parseSortingRules(rawSortingRules);
    }

    private parseSortingRules(rawSortingRules: RawGroupingPreference[]): GroupingPreference[] {
        const formattedRules = rawSortingRules.map((rule) => {
            return {
                order: rule.order,
                regex: RegExp(rule.regex, rule.regexFlags.join('')),
            };
        });

        return formattedRules;
    }
}
