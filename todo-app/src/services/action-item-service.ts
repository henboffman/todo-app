import { inject } from "aurelia";
import { DatabaseService } from "./database-service";
import { ActionItem, ActionItemPriority, ActionItemStatus } from "../models/action-item";

@inject(DatabaseService)
export class ActionItemService {
    public actionItems: ActionItem[] = [];
    public deletedActionItems: ActionItem[] = [];

    constructor(private databaseService: DatabaseService) {
        this.loadActionItems();
        this.loadDeletedActionItems();
    }

    async createActionItem(title: string, dueDate: string, priority: ActionItemPriority) {
        const actionItem = new ActionItem(title);
        actionItem.dueDate = dueDate;
        actionItem.priority = priority;
        await this.databaseService.addItem('actionItems', actionItem);
        await this.loadActionItems();
    }

    async loadActionItems() {
        const items = await this.databaseService.getAllItems('actionItems');
        this.actionItems = items.filter(item => !item.isDeleted);
    }

    async loadDeletedActionItems() {
        const items = await this.databaseService.getAllItems('actionItems');
        this.deletedActionItems = items.filter(item => item.isDeleted);
    }

    async createSimpleActionItem(title: string) {
        const actionItem = new ActionItem(title);
        await this.databaseService.addItem('actionItems', actionItem);
        await this.loadActionItems();
    }

    async softDeleteActionItem(actionItem: ActionItem) {
        actionItem.isDeleted = true;
        actionItem.deletedDate = new Date().toISOString();
        await this.databaseService.updateItem('actionItems', actionItem.key!, actionItem);
        await this.loadActionItems();
        await this.loadDeletedActionItems();
    }

    async restoreActionItem(actionItem: ActionItem) {
        actionItem.isDeleted = false;
        actionItem.deletedDate = null;
        await this.databaseService.updateItem('actionItems', actionItem.key!, actionItem);
        await this.loadActionItems();
        await this.loadDeletedActionItems();
    }

    async permanentlyDeleteActionItem(actionItem: ActionItem) {
        await this.databaseService.deleteItem('actionItems', actionItem.key!);
        await this.loadDeletedActionItems();
    }
}