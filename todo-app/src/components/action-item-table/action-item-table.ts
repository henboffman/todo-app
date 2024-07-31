import { bindable, inject } from 'aurelia';
import { ActionItem, ActionItemStatus } from '../../models/action-item';
import { ActionItemService } from '../../services/action-item-service';

@inject(ActionItemService)
export class ActionItemTable {
    // @ts-expect-error:null
    @bindable actionItems: ActionItem[] = [];

    constructor(private actionItemService: ActionItemService) { }

    attached() {
        console.log('ActionItemTable attached');
    }

    async loadActionItems() {
        await this.actionItemService.loadActionItems();
    }

    editItem(item: ActionItem) {
        // Implement edit logic
        console.log('Edit item:', item);
    }

    async completeItem(item: ActionItem) {
        item.complete();
        throw new Error('Not implemented');
        // await this.actionItemService.updateActionItem(item);
        await this.loadActionItems();
    }

    async deleteItem(item: ActionItem) {
        throw new Error('Not implemented');
        // await this.actionItemService.deleteActionItem(item.id);
        await this.loadActionItems();
    }
}