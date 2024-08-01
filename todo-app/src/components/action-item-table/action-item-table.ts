import { bindable, inject } from 'aurelia';
import { ActionItem, ActionItemContext, ActionItemPriority, ActionItemStatus } from '../../models/action-item';
import { ActionItemService } from '../../services/action-item-service';
import { TableFilterDialog } from '../../dialogs/table-filter-dialog/table-filter-dialog';
import { DialogService } from '@aurelia/dialog';

@inject(ActionItemService, DialogService)
export class ActionItemTable {
    // @ts-expect-error:null
    @bindable actionItems: ActionItem[] = [];
    private sortedAndFilteredItems: ActionItem[] = [];

    private editingItem: ActionItem | null = null;
    private sortField: keyof ActionItem | null = null;
    private sortDirection: 'asc' | 'desc' = 'asc';
    private filters: { [key: string]: string[] } = {};

    constructor(private actionItemService: ActionItemService, private dialogService: DialogService) { }

    attached() {
        console.log('ActionItemTable attached');
        this.updateSortedAndFilteredItems();
    }

    actionItemsChanged() {
        this.updateSortedAndFilteredItems();
    }

    editItem(item: ActionItem) {
        this.editingItem = item;
    }

    async saveItem(item: ActionItem) {
        await this.actionItemService.updateItem(item);
        this.editingItem = null;
        this.updateSortedAndFilteredItems();
    }

    cancelEdit() {
        this.editingItem = null;
    }

    sort(field: keyof ActionItem, direction: 'asc' | 'desc') {
        this.sortField = field;
        this.sortDirection = direction;
        this.updateSortedAndFilteredItems();
    }

    async toggleFilter(field: keyof ActionItem) {
        const distinctValues = [...new Set(this.actionItems.map(item => String(item[field])))];

        const { dialog } = await this.dialogService.open({
            component: () => TableFilterDialog,
            lock: true,
            startingZIndex: 10,
            keyboard: ["Escape"],
            model: {
                field,
                distinctValues,
                currentFilter: this.filters[field] || []
            }
        });

        const response = await dialog.closed;
        if (response.status === 'ok') {
            console.log("good response", response);
            this.filters[field] = response.value as string[];
            this.updateSortedAndFilteredItems();
        } else {
            console.log("bad response", response);
        }
    }

    updateSortedAndFilteredItems() {
        let items = [...this.actionItems];

        // Apply filters
        items = items.filter(item => {
            return Object.entries(this.filters).every(([field, values]) => {
                if (!values || values.length === 0) return true;  // Added null check
                return values.includes(String(item[field as keyof ActionItem]));
            });
        });

        // Apply sort
        if (this.sortField) {
            items.sort((a, b) => {
                const aValue = a[this.sortField!];
                const bValue = b[this.sortField!];
                if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        this.sortedAndFilteredItems = items;
    }

    toggleCompleted(item: ActionItem) {
        if (item.status === ActionItemStatus.Completed) {
            item.reopen();
        } else {
            item.complete();
        }
        this.actionItemService.updateItem(item);

        // Trigger animation
        item.animate = true;
        setTimeout(() => {
            item.animate = false;
        }, 500); // Match this to your animation duration

        this.updateSortedAndFilteredItems();
    }

    async completeItem(item: ActionItem) {
        item.complete();
        await this.actionItemService.updateItem(item);
        this.updateSortedAndFilteredItems();
    }

    async deleteItem(item: ActionItem) {
        await this.actionItemService.softDeleteActionItem(item);
        this.updateSortedAndFilteredItems();
    }

    get statusOptions() {
        return Object.values(ActionItemStatus);
    }

    get priorityOptions() {
        return Object.values(ActionItemPriority);
    }

    get contextOptions() {
        return Object.values(ActionItemContext);
    }
}