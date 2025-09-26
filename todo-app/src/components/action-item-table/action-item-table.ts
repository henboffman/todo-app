import { bindable, inject, observable } from 'aurelia';
import { ActionItem, ActionItemContext, ActionItemPriority, ActionItemStatus } from '../../models/action-item';
import { ActionItemService } from '../../services/action-item-service';
import { TableFilterDialog } from '../../dialogs/table-filter-dialog/table-filter-dialog';
import { ColumnSelectDialog } from '../../dialogs/column-select-dialog/column-select-dialog';
import { DialogService } from '@aurelia/dialog';
import { ActionItemEdit } from '../action-item-edit/action-item-edit';
import * as bootstrap from 'bootstrap';

@inject(ActionItemService, DialogService)
export class ActionItemTable {
    // @ts-expect-error:null
    @bindable actionItems: ActionItem[] = [];
    @bindable({ type: Boolean }) showCompleted: boolean = true;
    @observable private columns: { key: keyof ActionItem; name: string; selected: boolean; order: number }[] = [];
    // @observable private showCompleted: boolean = true;
    private sortedAndFilteredItems: ActionItem[] = [];

    private editingItem: ActionItem | null = null;
    private sortField: keyof ActionItem | null = null;
    private sortDirection: 'asc' | 'desc' = 'asc';
    private filters: { [key: string]: string[] } = {};
    private showLocalStorageLoadMessage: boolean = false;

    get visibleColumns() {
        return this.columns
            .filter(c => c.selected)
            .sort((a, b) => a.order - b.order);
    }

    constructor(private actionItemService: ActionItemService, private dialogService: DialogService) {
        this.loadColumnConfiguration();
    }

    showCompletedChanged() {
        this.toggleShowCompleted();
    }

    attached() {
        console.log('ActionItemTable attached');
        this.loadSortAndFilterStateFromLocalStorage();
        this.updateSortedAndFilteredItems();

    }

    actionItemsChanged() {
        this.updateSortedAndFilteredItems();
    }

    editItem(item: ActionItem) {
        this.editingItem = item;
    }

    loadColumnConfiguration() {
        const savedColumns = localStorage.getItem('actionItemColumns');
        if (savedColumns) {
            this.columns = JSON.parse(savedColumns);
        } else {
            // Default configuration
            this.columns = [
                { key: 'title', name: 'Title', selected: true, order: 1 },
                { key: 'status', name: 'Status', selected: true, order: 2 },
                { key: 'dueDate', name: 'Due Date', selected: true, order: 3 },
                { key: 'priority', name: 'Priority', selected: true, order: 4 },
                { key: 'context', name: 'Context', selected: true, order: 5 },
            ];
        }
    }

    async openColumnSelectDialog() {
        const { dialog } = await this.dialogService.open({
            component: () => ColumnSelectDialog,
            lock: true,
            startingZIndex: 10,
            keyboard: ["Escape"],
        });

        const response = await dialog.closed;
        if (response.status === 'ok') {
            console.log(response.value as { key: keyof ActionItem; name: string; selected: boolean; order: number }[]);
            this.columns = response.value as { key: keyof ActionItem; name: string; selected: boolean; order: number }[];
            this.updateSortedAndFilteredItems();
        }
    }

    async openEditDialog(actionItemId: string) {
        const { dialog } = await this.dialogService.open({
            component: () => ActionItemEdit,
            model: { id: actionItemId, isDialog: true },
            lock: true,
            startingZIndex: 10,
            keyboard: ["Escape"],
        });

        const response = await dialog.closed;
        if (response.status === 'ok') {
            this.editingItem = null;
            this.updateSortedAndFilteredItems();
        }
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

    // updateSortedAndFilteredItems() {
    //     let items = [...this.actionItems];

    //     // Apply filters
    //     items = items.filter(item => {
    //         return Object.entries(this.filters).every(([field, values]) => {
    //             if (!values || values.length === 0) return true;  // Added null check
    //             return values.includes(String(item[field as keyof ActionItem]));
    //         });
    //     });

    //     // Apply sort
    //     if (this.sortField) {
    //         items.sort((a, b) => {
    //             const aValue = a[this.sortField!];
    //             const bValue = b[this.sortField!];
    //             if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
    //             if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
    //             return 0;
    //         });
    //     }

    //     this.sortedAndFilteredItems = items;
    // }

    updateSortedAndFilteredItems() {
        let items = [...this.actionItems];

        // Filter out completed items if showCompleted is false
        if (!this.showCompleted) {
            items = items.filter(item => item.status !== ActionItemStatus.Completed);
        }

        // Apply existing filters
        items = items.filter(item => {
            return Object.entries(this.filters).every(([field, values]) => {
                if (!values || values.length === 0) return true;
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
        this.saveSortAndFilterStateToLocalStorage();

    }

    saveSortAndFilterStateToLocalStorage() {
        console.info("Saving sort and filter state to localStorage");
        localStorage.setItem('actionItemColumns', JSON.stringify(this.columns));
        localStorage.setItem('actionItemFilters', JSON.stringify(this.filters));
        localStorage.setItem('actionItemSortField', this.sortField || '');
        localStorage.setItem('actionItemSortDirection', this.sortDirection);
    }

    loadSortAndFilterStateFromLocalStorage() {
        let loadedSomethingFromLocalStorage = false;
        const savedColumns = localStorage.getItem('actionItemColumns');
        if (savedColumns) {
            this.columns = JSON.parse(savedColumns);
            loadedSomethingFromLocalStorage = true;
        }

        const savedFilters = localStorage.getItem('actionItemFilters');
        if (savedFilters) {
            this.filters = JSON.parse(savedFilters);
            loadedSomethingFromLocalStorage = true;
        }

        const savedSortField = localStorage.getItem('actionItemSortField');
        if (savedSortField) {
            this.sortField = savedSortField as keyof ActionItem;
            loadedSomethingFromLocalStorage = true;
        }

        const savedSortDirection = localStorage.getItem('actionItemSortDirection');
        if (savedSortDirection === 'asc' || savedSortDirection === 'desc') {
            this.sortDirection = savedSortDirection;
            loadedSomethingFromLocalStorage = true;
        }

        if (loadedSomethingFromLocalStorage) {
            console.info("Loaded sort and filter state from localStorage");
            this.showLocalStorageLoadMessage = true;
            setTimeout(() => {
                this.showLocalStorageLoadMessage = false;
            }, 8000);
        }
    }



    toggleShowCompleted() {
        this.updateSortedAndFilteredItems();
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