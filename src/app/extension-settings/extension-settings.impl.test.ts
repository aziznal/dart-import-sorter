import { IExtensionSettings } from './extension-settings.interface';

describe('Default extension settings', () => {
    let settings: IExtensionSettings;

    beforeEach(() => {
        settings = {
            leaveEmptyLinesBetweenImports: true,
            sortOnSaveEnabled: true,
            sortingRules: [
                {
                    order: 123,
                    regex: RegExp('^.*$'),
                },
            ],
        };
    });

    test('Should say hello world', () => {
        expect('hello world').toBe('hello world');
    });
});
