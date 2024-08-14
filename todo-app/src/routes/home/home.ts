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
	dueSoonExpanded = true;
	allItemsExpanded = true;
	dueSoonContent: HTMLElement;
	allItemsContent: HTMLElement;

	constructor(
		private dialogService: DialogService,
		private databaseService: DatabaseService,
		private actionItemService: ActionItemService
	) { }

	async attached() {
		await this.actionItemService.loadActionItems();
		this.setInitialContentHeight('dueSoonContent');
		this.setInitialContentHeight('allItemsContent');
	}

	setInitialContentHeight(contentRef: string) {
		const content = this[contentRef] as HTMLElement;
		if (this[`${contentRef.replace('Content', '')}Expanded`]) {
			this.expandSection(content);
		} else {
			this.collapseSection(content);
		}
	}

	toggleSection(section: 'dueSoon' | 'allItems') {
		this[`${section}Expanded`] = !this[`${section}Expanded`];
		const content = this[`${section}Content`] as HTMLElement;

		if (this[`${section}Expanded`]) {
			this.expandSection(content);
		} else {
			this.collapseSection(content);
		}
	}

	expandSection(content: HTMLElement) {
		// Remove any inline height to get the natural height
		content.style.height = 'auto';
		const sectionHeight = content.scrollHeight;

		// Set the height back to 0
		content.style.height = '0';

		// Force a reflow
		content.offsetHeight;

		// Set the height to the calculated value
		content.style.height = `${sectionHeight}px`;
		content.classList.add('expanded');

		// Remove the inline height after transition to allow for content changes
		setTimeout(() => {
			content.style.height = 'auto';
		}, 300); // Match this to your CSS transition time
	}

	collapseSection(content: HTMLElement) {
		// Set height to the current height to enable smooth transition
		const sectionHeight = content.scrollHeight;
		content.style.height = `${sectionHeight}px`;

		// Force a reflow
		content.offsetHeight;

		// Now set it to 0
		content.style.height = '0';
		content.classList.remove('expanded');
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