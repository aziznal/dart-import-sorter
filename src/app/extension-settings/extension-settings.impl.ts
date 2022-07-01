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
    private get extensionConfig() {
        return vscode.workspace.getConfiguration('dartimportsorter');
    }

    private get projectRootUri(): vscode.Uri {
        return vscode.workspace.workspaceFolders![0].uri;
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

    get projectName(): string {
        return this.getProjectNameFromPubspecFile(this.getPubspecFile());
    }

    private getSortingRules() {
        const rawSortingRules = this.extensionConfig.get(
            'matchingRules'
        ) as RawGroupingPreference[];

        return this.getParsedSortingRules(rawSortingRules);
    }

    private getParsedSortingRules(rawSortingRules: RawGroupingPreference[]): GroupingPreference[] {
        let rules = this.parseRawRules(rawSortingRules);

        rules = this.replacePlaceHoldersInRules(rules);

        return rules;
    }

    private parseRawRules(rawSortingRules: RawGroupingPreference[]) {
        return rawSortingRules.map((rule) => {
            return {
                order: rule.order,
                regex: RegExp(rule.regex, rule.regexFlags.join('')),
            };
        });
    }

    private replacePlaceHoldersInRules(rules: GroupingPreference[]) {
        return rules.map((rule) => {
            return this.replacePlaceholderWithProjectName(rule);
        });
    }

    private getProjectNameFromPubspecFile(pubspecContents: string): string {
        const nameProperty = pubspecContents
            .split('\n')
            .find((property) => Utils.removeSpaces(property.split(':')[0]) === 'name');

        if (nameProperty === undefined) {
            vscode.window.showInformationMessage(
                'Could not find name property in pubspec.yaml. Your imports may not be sorted correctly until this is fixed.'
            );

            return '';
        }

        return Utils.removeSpaces(nameProperty.split(':')[1]);
    }

    private getPubspecFile(): string {
        return fs.readFileSync(this.projectRootUri.fsPath + '/pubspec.yaml').toString();
    }

    private pubspecFileExists(): boolean {
        return fs.readdirSync(this.projectRootUri.fsPath).includes('pubspec.yaml');
    }

    private replacePlaceholderWithProjectName(rule: GroupingPreference) {
        if (!this.pubspecFileExists()) {
            return rule;
        }

        rule.regex = new RegExp(rule.regex.source.replace('<app_name>', this.projectName));
        return rule;
    }
}
