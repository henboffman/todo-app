import { inject } from "aurelia";
import { SettingsSidebar } from "./components/settings-sidebar/settings-sidebar";
import { ThemeService } from "./services/theme-service";
import { DialogService } from "@aurelia/dialog";
import { CreateActionItemDialog } from "./dialogs/create-action-item-dialog/create-action-item-dialog";
import { ActionItem } from "./models/action-item";
import { DatabaseService } from "./services/database-service";

@inject(ThemeService, DialogService, DatabaseService)
export class Home {
	public actionItems: ActionItem[] = [];

	private sidebarIcons = [
		{ icon: 'bi-layout-sidebar', action: 'toggleLeftSidebar', tooltip: 'Toggle Sidebar' },
		{ icon: 'bi-list-columns', action: 'toggleNavigation', tooltip: 'Navigation' },
		{ icon: 'bi-gear', action: 'activateSettingsSidebar', tooltip: 'Settings' },
	];

	private activeSection = '';
	private leftSidebarVisible = false

	constructor(private themeService: ThemeService, private dialogService: DialogService, private databaseService: DatabaseService) {
	}

	async attached() {
		await this.loadActionItems();
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
			await this.loadActionItems();
		}
	}

	async loadActionItems() {
		this.actionItems = await this.databaseService.getAllItems('actionItems');
	}

	handleSidebarAction(action: string) {
		console.log(action);
		this[action]();
		this.activeSection = action;
	}

	toggleLeftSidebar() {
		this.leftSidebarVisible = !this.leftSidebarVisible;
	}

	toggleNavigation() {
		this.contentSections.navigation.visible = !this.contentSections.navigation.visible;
		if (!this.leftSidebarVisible) {
			this.leftSidebarVisible = true;
		}
	}

	activateSettingsSidebar() {
		this.contentSections.settings.visible = !this.contentSections.settings.visible;
		if (!this.leftSidebarVisible) {
			this.leftSidebarVisible = true;
		}
	}

}
