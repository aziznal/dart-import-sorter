import { IExtensionSettings } from './extension-settings.interface';

describe('Default extension settings', () => {
    let settings: IExtensionSettings;

    beforeEach(() => {
        settings = {
            leaveEmptyLinesBetweenImports: true,
            sortOnSaveEnabled: true,
            sortingRules: [
                {
                    _type: 'GroupingPreference',
                    label: 'test',
                    order: 123,
                    regex: RegExp('^.*$'),
                },
            ],
            projectName: '',
        };
    });

    test('Should say hello world', () => {
        expect('hello world').toBe('hello world');
    });
});
