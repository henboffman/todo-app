import { inject } from 'aurelia';
import { DialogController } from '@aurelia/dialog';
import { ActionItemService } from '../../services/action-item-service';
import { ActionItem, ActionItemPriority, ActionItemStatus } from '../../models/action-item';

@inject(ActionItemService, DialogController)
export class ActionItemEdit {
    actionItem: ActionItem;
    statuses = Object.values(ActionItemStatus);
    priorities = Object.values(ActionItemPriority);
    contextOptions: string[];
    newTag: string = '';
    isDialog: boolean;

    constructor(private actionItemService: ActionItemService, private dialogController: DialogController) {
        this.contextOptions = this.actionItemService.contextOptions;
    }

    attached(): void {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    async activate(params: { id?: string, isDialog?: boolean }) {
        this.isDialog = params.isDialog ?? false;
        if (params.id) {
            this.actionItem = await this.actionItemService.getActionItem(params.id);
        } else {
            this.actionItem = new ActionItem('');
        }

        console.log(this.actionItem);
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.newTag.trim() !== '') {
            this.addTag();
        }
    }

    addTag() {
        this.actionItem.addTag(this.newTag.trim());
        this.newTag = '';
    }

    removeTag(tag: string) {
        this.actionItem.removeTag(tag);
    }

    async saveActionItem() {
        if (this.actionItem.key) {
            await this.actionItemService.updateItem(this.actionItem);
        } else {
            await this.actionItemService.createActionItem(
                this.actionItem.title,
                this.actionItem.dueDate,
                this.actionItem.priority
            );
        }

        if (this.isDialog) {
            this.dialogController.ok(true);
        } else {
            // Navigate back to the action items list or dashboard
            // You can implement this navigation logic when using it as a standalone component
        }
    }

    cancel() {
        if (this.isDialog) {
            this.dialogController.cancel();
        } else {
            // Navigate back to the action items list or dashboard
            // You can implement this navigation logic when using it as a standalone component
        }
    }
}