import { inject } from "aurelia";
import { DatabaseService } from "./database-service";
import { ActionItem, ActionItemPriority, ActionItemStatus } from "../models/action-item";
import DatabaseStores from "../common/database-stores";

@inject(DatabaseService, DatabaseStores)
export class ActionItemService {
	public actionItems: ActionItem[] = [];
	public deletedActionItems: ActionItem[] = [];

	constructor(private databaseService: DatabaseService) {
		this.loadActionItems();
		this.loadDeletedActionItems();
	}

	get upcomingItems(): ActionItem[] {
		return this.getTopUpcomingItems(this.actionItems, 6);
	}

	getTopUpcomingItems(items: ActionItem[], limit: number = 6): ActionItem[] {
		const now = new Date();

		return items
			.filter(item => !item.isDeleted && item.status !== ActionItemStatus.Completed)
			.sort((a, b) => {
				// First, sort by overdue status
				const aOverdue = a.isOverdue();
				const bOverdue = b.isOverdue();
				if (aOverdue && !bOverdue) return -1;
				if (!aOverdue && bOverdue) return 1;

				// If both are overdue or not overdue, sort by priority
				const priorityOrder = {
					[ActionItemPriority.Urgent]: 0,
					[ActionItemPriority.High]: 1,
					[ActionItemPriority.Medium]: 2,
					[ActionItemPriority.Low]: 3
				};
				const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
				if (priorityDiff !== 0) return priorityDiff;

				// If priorities are the same, sort by due date
				const aDueDate = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31); // Far future date for items without due date
				const bDueDate = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
				return aDueDate.getTime() - bDueDate.getTime();
			})
			.slice(0, limit);
	}

	async createActionItem(title: string, dueDate: string, priority: ActionItemPriority): Promise<ActionItem> {
		const actionItem = new ActionItem(title);
		actionItem.dueDate = dueDate;
		actionItem.priority = priority;
		await this.databaseService.addItem(DatabaseStores.ACTION_ITEMS, actionItem);
		await this.loadActionItems();
		return actionItem;
	}

	async updateItem(item: ActionItem): Promise<void> {
		await this.databaseService.updateItem(DatabaseStores.ACTION_ITEMS, item.key!, item);
		// await this.loadActionItems();
	}

	async loadActionItems() {
		const items = await this.databaseService.getAllItems(DatabaseStores.ACTION_ITEMS);
		this.actionItems = items
			.filter(item => !item.isDeleted)
			.map(item => ActionItem.fromObject(item));
		// set the animate property on each item to false
		this.actionItems.forEach(item => item.animate = false);
	}

	async loadDeletedActionItems() {
		const items = await this.databaseService.getAllItems(DatabaseStores.ACTION_ITEMS);
		this.deletedActionItems = items
			.filter(item => item.isDeleted)
			.map(item => ActionItem.fromObject(item));
	}

	async createSimpleActionItem(title: string) {
		const actionItem = new ActionItem(title);
		await this.databaseService.addItem(DatabaseStores.ACTION_ITEMS, actionItem);
		await this.loadActionItems();
	}

	async softDeleteActionItem(actionItem: ActionItem) {
		actionItem.isDeleted = true;
		actionItem.deletedDate = new Date().toISOString();
		await this.databaseService.updateItem(DatabaseStores.ACTION_ITEMS, actionItem.key!, actionItem);
		await this.loadActionItems();
		await this.loadDeletedActionItems();
	}

	async restoreActionItem(actionItem: ActionItem) {
		actionItem.isDeleted = false;
		actionItem.deletedDate = null;
		await this.databaseService.updateItem(DatabaseStores.ACTION_ITEMS, actionItem.key!, actionItem);
		await this.loadActionItems();
		await this.loadDeletedActionItems();
	}

	async permanentlyDeleteActionItem(actionItem: ActionItem) {
		await this.databaseService.deleteItem(DatabaseStores.ACTION_ITEMS, actionItem.key!);
		await this.loadDeletedActionItems();
	}
}