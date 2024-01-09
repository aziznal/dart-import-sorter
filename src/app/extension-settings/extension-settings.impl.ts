import { SubSortingRule, RawSubSortingRule } from '../types/sorting-rule';
import { injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { SortingRule, RawSortingRule } from '../types/sorting-rule';

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

    get sortingRules(): SortingRule[] {
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

    #getSortingRules(): SortingRule[] {
        const rawSortingRules = this.#extensionConfig.get('matchingRules') as RawSortingRule[];

        return this.#getParsedSortingRules(rawSortingRules);
    }

    #getParsedSortingRules(rawSortingRules: RawSortingRule[]): SortingRule[] {
        let rules = this.#parseRawRules(rawSortingRules);

        return rules.map((rule) => {
            return this.#replacePlaceholderWithProjectName(rule);
        });
    }

    #parseRawRules(rawSortingRules: RawSortingRule[]): SortingRule[] {
        return rawSortingRules.map((rule) => {
            return {
                _type: 'SortingRule',
                label: rule.label,
                order: rule.order,
                regex: RegExp(rule.regex, rule.regexFlags?.join('')),
                subgroupSortingRules: this.#parseRawSubgroupingRules(rule.subgroupSortingRules),
            };
        });
    }

    #parseRawSubgroupingRules(
        rawSubgroupSortingRules?: RawSubSortingRule[]
    ): SubSortingRule[] | undefined {
        if (!rawSubgroupSortingRules) {
            return;
        }

        return rawSubgroupSortingRules
            .map<SubSortingRule>((rule) => {
                return {
                    _type: 'SubSortingRule',
                    label: rule.label,
                    order: rule.order,
                    regex: RegExp(rule.regex, rule.regexFlags?.join('')),
                };
            })
            .map((rule) => {
                return this.#replacePlaceholderWithProjectName(rule);
            });
    }

    #getProjectNameFromPubspecFile(pubspecContents: string): string {
        const nameProperty = pubspecContents
            .split('\n')
            .find((property) => Utils.removeSpaces(property.split(':')[0]) === 'name');

        if (nameProperty === undefined) {
            vscode.window.showInformationMessage(
                'Could not find name property in pubspec.yaml. Imports cannot be sorted by project name.'
            );

            return '';
        }

        return Utils.removeNewLines(Utils.removeSpaces(nameProperty.split(':')[1]));
    }

    #getPubspecFile(): string {
        return fs.readFileSync(this.#projectRootUri.fsPath + '/pubspec.yaml').toString();
    }

    #hasPubspecFile(): boolean {
        return fs.readdirSync(this.#projectRootUri.fsPath).includes('pubspec.yaml');
    }

    #replacePlaceholderWithProjectName<T extends SortingRule | SubSortingRule>(rule: T): T {
        if (!this.#hasPubspecFile()) {
            return rule;
        }

        rule.regex = new RegExp(rule.regex.source.replace('<app_name>', this.projectName));

        return rule;
    }
}
