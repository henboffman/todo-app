import { ActionItemService } from './../../services/action-item-service';
// src/dialogs/create-action-item-dialog.ts

import { DialogController } from '@aurelia/dialog';
import { inject } from 'aurelia';
import { ActionItem, ActionItemContext, ActionItemPriority, ActionItemStatus } from '../../models/action-item';

@inject(DialogController, ActionItemService)
export class CreateActionItemDialog {
    actionItem: ActionItem;
    statuses: string[];
    priorities: string[];
    contexts: string[];

    constructor(private dialogController: DialogController, private actionItemService: ActionItemService) {
        this.actionItem = new ActionItem('');
        this.statuses = Object.values(ActionItemStatus);
        this.priorities = Object.values(ActionItemPriority);
        this.contexts = Object.values(ActionItemContext);
    }

    async save() {
        try {
            // await this.actionItemService.createSimpleActionItem(this.actionItem);
            this.dialogController.ok(this.actionItem);
        } catch (error) {
            console.error('Error saving action item:', error);
            // Handle error (e.g., show error message to user)
        }
    }

    cancel() {
        this.dialogController.cancel();
    }
}