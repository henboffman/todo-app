import { inject } from "aurelia";
import { DatabaseService } from "./database-service";
import { ActionItem } from "../models/action-item";

@inject(DatabaseService)
export class ActionItemService {
    public actionItems: ActionItem[] = [];


    constructor(private databaseService: DatabaseService) {
        this.loadActionItems();
    }

    async loadActionItems() {
        this.actionItems = await this.databaseService.getAllItems('actionItems');
    }
}