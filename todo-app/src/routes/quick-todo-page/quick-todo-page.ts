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
	private isInputExpanded: boolean = false;
	private initialContainerWidth: number = 0;
	private maxContainerWidth: number = 0;

	constructor(private actionItemService: ActionItemService) {
		this.priorities = Object.values(ActionItemPriority);
	}

	attached() {
		console.log("load todo page");
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
		const todoInput = document.getElementById("todo-input") as HTMLTextAreaElement;
		todoInput?.focus();
		todoInput?.addEventListener('input', this.autoResizeTextarea);

		const container = document.querySelector('.quick-todo-container') as HTMLElement;
		this.initialContainerWidth = container.offsetWidth;
		this.maxContainerWidth = this.initialContainerWidth * 1.6; // 80% wider than initial
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
		const container = document.querySelector('.quick-todo-container') as HTMLElement;

		// Create a hidden div to measure text width
		const hiddenDiv = document.createElement('div');
		hiddenDiv.style.position = 'absolute';
		hiddenDiv.style.top = '-9999px';
		hiddenDiv.style.width = 'auto';
		hiddenDiv.style.whiteSpace = 'pre';
		hiddenDiv.style.font = window.getComputedStyle(textarea).font;
		hiddenDiv.textContent = textarea.value || '.'; // Ensure there's always some content
		document.body.appendChild(hiddenDiv);

		const textWidth = hiddenDiv.offsetWidth;
		document.body.removeChild(hiddenDiv);

		// Calculate new width
		const newWidth = Math.max(this.initialContainerWidth, Math.min(textWidth + 40, this.maxContainerWidth));

		if (newWidth > this.initialContainerWidth && newWidth < this.maxContainerWidth) {
			// Grow with text
			container.style.width = `${newWidth}px`;
			this.isInputExpanded = false;
			textarea.style.whiteSpace = 'nowrap';
			textarea.style.overflowWrap = 'normal';
		} else if (newWidth >= this.maxContainerWidth) {
			// Switch to multi-line
			if (!this.isInputExpanded) {
				this.isInputExpanded = true;
				container.classList.add('expanded');
				textarea.style.whiteSpace = 'normal';
				textarea.style.overflowWrap = 'break-word';
			}
			container.style.width = '80%';
		} else {
			// Reset to initial width
			container.style.width = `${this.initialContainerWidth}px`;
			this.isInputExpanded = false;
			textarea.style.whiteSpace = 'nowrap';
			textarea.style.overflowWrap = 'normal';
		}

		// Adjust height
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	resetInputState() {
		this.isInputExpanded = false;
		const container = document.querySelector('.quick-todo-container') as HTMLElement;
		container.classList.remove('expanded');
		container.style.width = `${this.initialContainerWidth}px`;
		const textarea = document.getElementById("todo-input") as HTMLTextAreaElement;
		textarea.style.whiteSpace = 'nowrap';
		textarea.style.overflowWrap = 'normal';
		textarea.style.height = 'auto';
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

				// Reset the input state after saving
				this.resetInputState();

				const textarea = document.getElementById("todo-input") as HTMLTextAreaElement;
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