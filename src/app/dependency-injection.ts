import { container } from 'tsyringe';

import { ExtensionSettings } from './extension-settings/extension-settings.impl';
import { FileInteractor } from './file-interactor/file-interactor.impl';
import { ImportSorter } from './import-sorter/import-sorter.impl';

export const INJECTION_TOKENS = {
    importSorter: 'IImportSorter',
    extensionSettings: 'IExtensionSettings',
    fileInteractor: 'IFileInteractor',
};

container.register(INJECTION_TOKENS.extensionSettings, {
    useClass: ExtensionSettings,
});

container.register(INJECTION_TOKENS.importSorter, {
    useClass: ImportSorter,
});

container.register(INJECTION_TOKENS.fileInteractor, {
    useClass: FileInteractor,
});
