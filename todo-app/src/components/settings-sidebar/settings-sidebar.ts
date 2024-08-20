import { ActionItemService } from './../../services/action-item-service';

import { inject } from "aurelia";
import { Modal } from "bootstrap";
import { ThemeService } from "../../services/theme-service";
import { CustomContextManagerDialog } from '../../dialogs/custom-context-manager-dialog/custom-context-manager-dialog';
import { DialogService } from '@aurelia/dialog';

@inject(ThemeService, ActionItemService, DialogService)
export class SettingsSidebar {
    private dataToImport: string = "";

    constructor(private themeService: ThemeService, private actionItemService: ActionItemService, private dialogService: DialogService) { }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }

    async openCustomContextManager() {
        const { dialog } = await this.dialogService.open({
            component: () => CustomContextManagerDialog,
            lock: true,
            startingZIndex: 10,
            keyboard: ["Escape"],
        });

        const response = await dialog.closed;
        if (response.status === 'ok') {
            this.actionItemService.customContextOptions = response.value as string[];
            await this.actionItemService.saveCustomContextOptions();
            await this.actionItemService.loadActionItems();
        }
    }


    // async importData(): Promise<void> {
    //     if (this.dataToImport) {
    //         await this.notesService.importNotesAndCollections(this.dataToImport, this.skipDuplicates);
    //         this.dataToImport = '';
    //     }
    // }

}