// custom-context-manager-dialog.ts
import { inject } from 'aurelia';
import { DialogController } from '@aurelia/dialog';
import { ActionItemService } from '../../services/action-item-service';

@inject(DialogController, ActionItemService)
export class CustomContextManagerDialog {
    customContexts: string[] = [];
    newContext: string = '';

    constructor(private dialogController: DialogController, private actionItemService: ActionItemService) {
        this.customContexts = [...this.actionItemService.customContextOptions];
    }

    async addContext() {
        if (this.newContext && !this.customContexts.includes(this.newContext)) {
            this.customContexts.push(this.newContext);
            this.newContext = '';
        }
    }

    async removeContext(context: string) {
        const index = this.customContexts.indexOf(context);
        if (index > -1) {
            this.customContexts.splice(index, 1);
        }
    }

    close() {
        this.dialogController.ok(this.customContexts);
    }

}