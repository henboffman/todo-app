import { inject } from "aurelia";
import { DatabaseService } from "./database-service";
import { ActionItem, ActionItemContext, ActionItemPriority, ActionItemStatus } from "../models/action-item";
import DatabaseStores from "../common/database-stores";
import { CustomContextManagerDialog } from "../dialogs/custom-context-manager-dialog/custom-context-manager-dialog";
import { DialogService } from "@aurelia/dialog";

// Define keywords for auto-tagging contexts
const CONTEXT_KEYWORDS: { [key: string]: string } = {
	// Communication
	'call': ActionItemContext.Calls,
	'phone': ActionItemContext.Calls,
	'email': ActionItemContext.Email,
	'mail': ActionItemContext.Email,
	'meet': ActionItemContext.Meet,
	'meeting': ActionItemContext.Meet,
	'schedule': ActionItemContext.Meet,    // Catches "schedule time with"
	'chat': ActionItemContext.Chat,
	'message': ActionItemContext.Chat,
	'ping': ActionItemContext.TeamChat,
	'teams': ActionItemContext.TeamChat,
	'slack': ActionItemContext.TeamChat,

	// Development & Work
	'dev': ActionItemContext.Development,   // Changed from .Computer for consistency
	'code': ActionItemContext.Development,  // Changed from .Computer for consistency
	'develop': ActionItemContext.Development, // Changed from .Computer for consistency
	'backlog': ActionItemContext.Development, // Catches "...to the backlog"
	'work on': ActionItemContext.Work,

	// Planning & Research
	'we need to': ActionItemContext.Plan,   // Catches "we need to"
	'learn': ActionItemContext.Research,      // Catches "learn how"

	// Personal & Home
	'buy': ActionItemContext.Errands,
	'shop': ActionItemContext.Errands,
	'errand': ActionItemContext.Errands,
	'fix': ActionItemContext.Home,
	'clean': ActionItemContext.Home,
	'organize': ActionItemContext.Home,
};


@inject(DatabaseService, DatabaseStores, DialogService)
export class ActionItemService {
	public actionItems: ActionItem[] = [];
	public deletedActionItems: ActionItem[] = [];
	public customContextOptions: string[] = [];

	private readonly CONTEXT_OPTIONS_KEY = 1; // Use a fixed key for storing context options

	constructor(private databaseService: DatabaseService, private dialogService: DialogService) {
		this.loadActionItems();
		this.loadDeletedActionItems();
		this.loadCustomContextOptions();
	}

	/**
	 * Determines the context of an action item based on keywords in its title.
	 * @param title The title of the action item.
	 * @returns The determined context or a default value.
	 */
	private _getContextFromTitle(title: string): string {
		const lowerCaseTitle = title.toLowerCase();
		for (const keyword in CONTEXT_KEYWORDS) {
			// Use word boundaries to avoid partial matches (e.g., "email" in "detailed")
			const regex = new RegExp(`\\b${keyword}\\b`);
			if (regex.test(lowerCaseTitle)) {
				return CONTEXT_KEYWORDS[keyword];
			}
		}
		return ActionItemContext.NotSelected;
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
		// Automatically set the context based on the title
		actionItem.context = this._getContextFromTitle(title);
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

	async getActionItem(id: string): Promise<ActionItem | undefined> {
		// First, try to find the item in the in-memory actionItems array
		let item = this.actionItems.find(item => item.id === id);

		// If not found, check the deletedActionItems array
		if (!item) {
			item = this.deletedActionItems.find(item => item.id === id);
		}

		// If still not found, try to fetch from the database
		if (!item) {
			const dbItem = await this.databaseService.getItem(DatabaseStores.ACTION_ITEMS, id);
			if (dbItem) {
				item = ActionItem.fromObject(dbItem);
			}
		}

		return item;
	}

	async createSimpleActionItem(title: string) {
		const actionItem = new ActionItem(title);
		// Automatically set the context based on the title
		actionItem.context = this._getContextFromTitle(title);
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


	async loadCustomContextOptions() {
		try {
			const options = await this.databaseService.getItem(DatabaseStores.CUSTOM_CONTEXTS, this.CONTEXT_OPTIONS_KEY);
			// convert ActionItemContext enum values to string array
			const defaultContextOptions = Object.values(ActionItemContext).filter(value => typeof value === 'string');
			this.customContextOptions = options?.contexts || defaultContextOptions;
		} catch (error) {
			console.error("Error loading custom context options:", error);
			this.customContextOptions = Object.values(ActionItemContext).filter(value => typeof value === 'string');
		}
	}

	async addCustomContextOption(option: string) {
		if (!this.customContextOptions.includes(option)) {
			this.customContextOptions.push(option);
			await this.saveCustomContextOptions();
		}
	}

	async removeCustomContextOption(option: string) {
		const index = this.customContextOptions.indexOf(option);
		if (index > -1) {
			this.customContextOptions.splice(index, 1);
			await this.saveCustomContextOptions();
		}
	}



	async saveCustomContextOptions() {
		const contextOptionsData = {
			key: this.CONTEXT_OPTIONS_KEY,
			contexts: this.customContextOptions
		};
		await this.databaseService.updateItem(DatabaseStores.CUSTOM_CONTEXTS, this.CONTEXT_OPTIONS_KEY, contextOptionsData);
	}

	get contextOptions() {
		return ['Not Selected', ...this.customContextOptions];
	}

}