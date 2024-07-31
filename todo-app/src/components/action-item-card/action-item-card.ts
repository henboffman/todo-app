import { bindable, inject } from 'aurelia';
import { ActionItem } from '../../models/action-item';
import { ActionItemService } from '../../services/action-item-service';

@inject(ActionItemService)
export class ActionItemCard {
    // @ts-expect-error:null
    @bindable actionItem: ActionItem;
    isExpanded: boolean = false;

    constructor(private actionItemService: ActionItemService) { }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    async deleteItem() {
        if (confirm('Are you sure you want to delete this item?')) {
            await this.actionItemService.softDeleteActionItem(this.actionItem);
        }
    }
}