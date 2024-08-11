// routes/home/home.ts
import { inject } from "aurelia";
import { DialogService } from "@aurelia/dialog";
import { DatabaseService } from "../../services/database-service";
import { ActionItemService } from "../../services/action-item-service";
import { CreateActionItemDialog } from "../../dialogs/create-action-item-dialog/create-action-item-dialog";
import { QuickTodoDialog } from "../../dialogs/quick-todo-dialog/quick-todo-dialog";
import { QuickTodoResult } from "../../models/interfaces/quick-todo-result";

@inject(DialogService, DatabaseService, ActionItemService)
export class Home {
	constructor(
		private dialogService: DialogService,
		private databaseService: DatabaseService,
		private actionItemService: ActionItemService
	) { }

	async attached() {
		await this.actionItemService.loadActionItems();
	}

	async openCreateDialog() {
		const result = await this.dialogService.open({
			component: () => CreateActionItemDialog,
			lock: false
		});

		if (!result.wasCancelled) {
			await this.actionItemService.loadActionItems();
		}
	}

	async openQuickTodoDialog() {
		const { dialog } = await this.dialogService.open({
			component: () => QuickTodoDialog,
			lock: true,
			startingZIndex: 10,
			keyboard: ["Escape"]
		});

		const response = await dialog.closed;
		if (response.status === 'ok') {
			const todoResult = response.value as QuickTodoResult;
			await this.actionItemService.createActionItem(
				todoResult.title,
				todoResult.dueDate,
				todoResult.priority
			);
		}
	}
}