import { bindable, inject } from 'aurelia';
import { ActionItem, ActionItemStatus } from '../../models/action-item';
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

    getCardClass(): string {
        if (this.actionItem.status === ActionItemStatus.Completed) {
            return 'completed';
        }

        if (!this.actionItem.dueDate) {
            return '';
        }

        const dueDate = new Date(this.actionItem.dueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

        if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays <= 3) {
            return 'due-soon';
        }

        return '';
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
        const date = new Date(dateString + 'T00:00:00Z');
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    }

    async deleteItem(): Promise<void> {
        if (confirm('Are you sure you want to delete this item?')) {
            await this.actionItemService.softDeleteActionItem(this.actionItem);
        }
    }
}