import { injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { GroupingPreference, RawGroupingPreference } from '../types/grouping-preference.model';

import { IExtensionSettings } from './extension-settings.interface';

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
        const pubspecFile = this.getPubspecFile();

        try {
            const projectName = this.getProjectNameFromPubspecFile(pubspecFile);

            return projectName;
        } catch (e: unknown) {
            vscode.window.showInformationMessage(
                'Could not find a pubspec.yaml file in your project. Imports may be sorted incorrectly until you fix this.'
            );

            throw new Error(
                'Could not find a pubspec.yaml file in your project. Imports may be sorted incorrectly until you fix this.'
            );
        }
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

    private getProjectNameFromPubspecFile(pubspecContents: string): string {
        const nameProperty = pubspecContents
            .split('\n')
            .find((property) => this.removeSpaces(property.split(':')[0]) === 'name');

        if (nameProperty === undefined) {
            throw new Error('Could find name property in pubspec.yaml');
        }

        return this.removeSpaces(nameProperty.split(':')[1]);
    }

    private removeSpaces(value: string): string {
        return value.split(' ').join('');
    }

    private getPubspecFile(): string {
        const dirContents = fs.readdirSync(this.projectRootUri.path);

        if (!dirContents.includes('pubspec.yaml')) {
            throw new Error('Could not find pubspec.yaml file');
        }

        const pubspecFile = fs.readFileSync(this.projectRootUri.path + '/pubspec.yaml').toString();

        return pubspecFile;
    }
}
