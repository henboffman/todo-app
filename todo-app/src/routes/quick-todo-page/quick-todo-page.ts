import { inject, observable } from 'aurelia';
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
	@observable recentItemsSize: number = 5;

	private recentlyAdded: ActionItem[] = [];

	constructor(private actionItemService: ActionItemService) {
		this.priorities = Object.values(ActionItemPriority);
	}

	attached() {
		console.log("load todo page");
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
		const todoInput = document.getElementById("todo-input") as HTMLTextAreaElement;
		todoInput?.focus();
		todoInput?.addEventListener('input', this.autoResizeTextarea);
	}

	detached() {
		window.removeEventListener('keydown', this.handleKeyDown.bind(this));
		const todoInput = document.getElementById("todo-input") as HTMLTextAreaElement;
		todoInput?.removeEventListener('input', this.autoResizeTextarea);
	}

	recentItemsSizeChanged() {
		if (this.recentItemsSize < 1) {
			this.recentItemsSize = 1;
		}
	}

	async handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && this.todoValue.trim() !== "") {
			event.preventDefault();
			await this.saveTodo();
		}
	}

	autoResizeTextarea = () => {
		const textarea = document.getElementById("todo-input") as HTMLTextAreaElement;
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}

	async saveTodo() {
		if (this.todoValue.trim() !== "") {
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

				const textarea = document.getElementById("todo-input") as HTMLTextAreaElement;
				textarea.style.height = 'auto';
				textarea.focus();
			})
				.catch((error) => {
					console.error("Error saving todo:", error);
				});
		}
	}

	addToRecentlyAdded(item: ActionItem) {
		this.recentlyAdded.unshift(item);
		if (this.recentlyAdded.length > this.recentItemsSize) {
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