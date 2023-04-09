import {
    SubgroupingPreference,
    RawSubgroupingPreference,
} from './../types/grouping-preference.model';
import { injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { GroupingPreference, RawGroupingPreference } from '../types/grouping-preference.model';

import { IExtensionSettings } from './extension-settings.interface';

import { Utils } from '../utils/utils';

import fs = require('fs');

/**
 * Stores refs to all extension settings. Latest state is always returned since
 * everything is implemented in getters.
 */
@injectable()
export class ExtensionSettings implements IExtensionSettings {
    get leaveEmptyLinesBetweenImports(): boolean {
        return this.#extensionConfig.get('leaveEmptyLinesBetweenGroups') as boolean;
    }

    get sortingRules(): GroupingPreference[] {
        return this.#getSortingRules();
    }

    get sortOnSaveEnabled(): boolean {
        return this.#extensionConfig.get('sortOnSave') as boolean;
    }

    get projectName(): string {
        return this.#getProjectNameFromPubspecFile(this.#getPubspecFile());
    }

    get #extensionConfig() {
        return vscode.workspace.getConfiguration('dartimportsorter');
    }

    get #projectRootUri(): vscode.Uri {
        return vscode.workspace.workspaceFolders![0].uri;
    }

    #getSortingRules(): GroupingPreference[] {
        const rawSortingRules = this.#extensionConfig.get(
            'matchingRules'
        ) as RawGroupingPreference[];

        return this.#getParsedSortingRules(rawSortingRules);
    }

    #getParsedSortingRules(rawSortingRules: RawGroupingPreference[]): GroupingPreference[] {
        let rules = this.#parseRawRules(rawSortingRules);

        rules = this.#replacePlaceHoldersInRules(rules);

        return rules;
    }

    #parseRawRules(rawSortingRules: RawGroupingPreference[]): GroupingPreference[] {
        return rawSortingRules.map((rule) => {
            return {
                _type: 'GroupingPreference',
                label: rule.label,
                order: rule.order,
                regex: RegExp(rule.regex, rule.regexFlags.join('')),
                subgroupSortingRules: this.#parseRawSubgroupingRules(rule.rawSubgroupSortingRules),
            };
        });
    }

    #parseRawSubgroupingRules(
        rawSubgroupSortingRules?: RawSubgroupingPreference[]
    ): SubgroupingPreference[] | undefined {
        if (rawSubgroupSortingRules === undefined) {
            return undefined;
        }

        return rawSubgroupSortingRules
            .map<SubgroupingPreference>((rule) => {
                return {
                    _type: 'SubgroupingPreference',
                    label: rule.label,
                    order: rule.order,
                    regex: RegExp(rule.regex, rule.regexFlags.join('')),
                };
            })
            .map((rule) => {
                return this.#replacePlaceholderWithProjectName(rule);
            });
    }

    #replacePlaceHoldersInRules<T extends GroupingPreference | SubgroupingPreference>(
        rules: T[]
    ): T[] {
        return rules.map((rule) => {
            return this.#replacePlaceholderWithProjectName(rule);
        });
    }

    #getProjectNameFromPubspecFile(pubspecContents: string): string {
        const nameProperty = pubspecContents
            .split('\n')
            .find((property) => Utils.removeSpaces(property.split(':')[0]) === 'name');

        if (nameProperty === undefined) {
            vscode.window.showInformationMessage(
                'Could not find name property in pubspec.yaml. Your imports may not be sorted correctly until this is fixed.'
            );

            return '';
        }

        return Utils.removeNewLines(Utils.removeSpaces(nameProperty.split(':')[1]));
    }

    #getPubspecFile(): string {
        return fs.readFileSync(this.#projectRootUri.fsPath + '/pubspec.yaml').toString();
    }

    #pubspecFileExists(): boolean {
        return fs.readdirSync(this.#projectRootUri.fsPath).includes('pubspec.yaml');
    }

    #replacePlaceholderWithProjectName<T extends GroupingPreference | SubgroupingPreference>(
        rule: T
    ): T {
        if (!this.#pubspecFileExists()) {
            return rule;
        }

        rule.regex = new RegExp(rule.regex.source.replace('<app_name>', this.projectName));

        return rule;
    }
}
