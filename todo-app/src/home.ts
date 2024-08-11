import { inject } from "aurelia";
import { SettingsSidebar } from "./components/settings-sidebar/settings-sidebar";
import { ThemeService } from "./services/theme-service";
import { DialogService } from "@aurelia/dialog";
import { CreateActionItemDialog } from "./dialogs/create-action-item-dialog/create-action-item-dialog";
import { ActionItem } from "./models/action-item";
import { DatabaseService } from "./services/database-service";
import { QuickTodoDialog } from "./dialogs/quick-todo-dialog/quick-todo-dialog";
import { ActionItemService } from "./services/action-item-service";
import { QuickTodoResult } from "./models/interfaces/quick-todo-result";

@inject(ThemeService, DialogService, DatabaseService, ActionItemService)
export class Home {

	private sidebarIcons = [
		{ icon: 'bi-layout-sidebar', action: 'toggleLeftSidebar', tooltip: 'Toggle Sidebar' },
		{ icon: 'bi-list-columns', action: 'toggleNavigation', tooltip: 'Navigation' },
		{ icon: 'bi-gear', action: 'activateSettingsSidebar', tooltip: 'Settings' },
	];

	private activeSection = '';
	private leftSidebarVisible = false

	constructor(
		private themeService: ThemeService,
		private dialogService: DialogService,
		private databaseService: DatabaseService,
		private actionItemService: ActionItemService) { }


	async attached() {
		// await this.actionItemService.loadActionItems();
	}

	private contentSections = {
		navigation: { visible: false, component: 'navigation-component' },
		settings: { visible: false, component: 'settings-sidebar' }
	};

	async openCreateDialog() {
		const result = await this.dialogService.open({
			component: () => CreateActionItemDialog,
			lock: false
		});

		console.log(result);

		if (!result.wasCancelled) {
			console.log("Refresh the list of action items");
			// Refresh the list of action items
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
			console.log("good response", response);
			const todoResult = response.value as QuickTodoResult;
			// return await this.actionItemService.createSimpleActionItem(response.value as string);
			await this.actionItemService.createActionItem(
				todoResult.title,
				todoResult.dueDate,
				todoResult.priority
			);
		} else {
			console.log("bad response", response);
		}

	}

	// async openQuickTodoDialog() {
	// 	const result = await this.dialogService.open({
	// 		component: () QuickTodoDialog,
	// 		lock: false
	// 	});

	// 	if (!result.wasCancelled) {
	// 		const todoResult = result.value as QuickTodoResult;
	// 		await this.actionItemService.createActionItem(
	// 			todoResult.title,
	// 			todoResult.dueDate,
	// 			todoResult.priority
	// 		);
	// 	}
	// }

	// async openQuickTodoDialog() {
	// 	const result = await this.dialogService.open({
	// 		component: QuickTodoDialog,
	// 		lock: false
	// 	});

	// 	if (!result.wasCancelled) {
	// 		const { title, dueDate, priority } = result.value;
	// 		await this.actionItemService.createActionItem(title, dueDate, priority);
	// 	}
	// }



	handleSidebarAction(action: string) {
		console.log(action);
		this[action]();
		this.activeSection = action;
	}

	toggleLeftSidebar() {
		this.leftSidebarVisible = !this.leftSidebarVisible;
	}

	toggleNavigation() {
		this.contentSections.settings.visible = false;
		this.contentSections.navigation.visible = true;
		if (!this.leftSidebarVisible) {
			this.leftSidebarVisible = true;
		}
	}

	activateSettingsSidebar() {
		this.contentSections.navigation.visible = false;
		this.contentSections.settings.visible = true;

		if (!this.leftSidebarVisible) {
			this.leftSidebarVisible = true;
		}

	}

}
