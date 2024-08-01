import { bindable, inject } from 'aurelia';
import { ActionItem } from '../../models/action-item';
import { ActionItemService } from '../../services/action-item-service';

@inject(ActionItemService)
export class ActionItemCard {
    // @ts-expect-error:null
    @bindable actionItem: ActionItem;
    isExpanded: boolean = false;
    editingDate: boolean = false;
    dateBeforeEdit: string | null = null;

    constructor(private actionItemService: ActionItemService) { }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
    }

    editDate(): void {
        this.dateBeforeEdit = this.actionItem.dueDate;
        this.editingDate = true;
    }

    cancelEdit(): void {
        this.actionItem.dueDate = this.dateBeforeEdit;
        this.editingDate = false;
    }

    async saveDate(): Promise<void> {
        this.editingDate = false;
        await this.actionItemService.updateItem(this.actionItem);
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    async deleteItem(): Promise<void> {
        if (confirm('Are you sure you want to delete this item?')) {
            await this.actionItemService.softDeleteActionItem(this.actionItem);
        }
    }
}