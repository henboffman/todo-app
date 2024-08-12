import { inject } from 'aurelia';
import { ActionItem, ActionItemPriority } from '../../models/action-item';
import * as bootstrap from 'bootstrap';
import { ActionItemService } from '../../services/action-item-service';

@inject(ActionItemService)
export class QuickTodoPage {
	private todoValue: string = "";
	private dueDate: string = "";
	private priority: ActionItemPriority = ActionItemPriority.Medium;
	private isExpanded: boolean = false;
	private priorities: string[];

	private recentlyAdded: ActionItem[] = [];

	constructor(private actionItemService: ActionItemService) {
		this.priorities = Object.values(ActionItemPriority);
	}

	attached() {
		console.log("load todo page");
		document.getElementById("todo-input")?.focus();
	}

	async saveTodo() {
		if (this.todoValue !== "") {
			console.log("Saving todo:", {
				title: this.todoValue,
				dueDate: this.dueDate,
				priority: this.priority
			});

			await this.actionItemService.createActionItem(
				this.todoValue,
				this.dueDate,
				this.priority
			).then((createdItem: ActionItem) => {
				this.showSuccessToast();
				this.addToRecentlyAdded(createdItem);

				this.todoValue = "";
				this.dueDate = "";
				this.priority = ActionItemPriority.Medium;
				this.isExpanded = false;
			})
				.catch((error) => {
					console.error("Error saving todo:", error);
				});


		}
	}

	addToRecentlyAdded(item: ActionItem) {
		this.recentlyAdded.unshift(item);
		if (this.recentlyAdded.length > 5) {
			this.recentlyAdded.pop();
		}
	}

	toggleExpand() {
		this.isExpanded = !this.isExpanded;
	}

	showSuccessToast() {
		const toastLiveExample = document.getElementById('successToast');
		const toastBodyElement = toastLiveExample?.querySelector('.toast-body span');

		if (toastBodyElement) {
			toastBodyElement.textContent = "Created new todo item";
		}

		const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
		toastBootstrap.show();
	}
}