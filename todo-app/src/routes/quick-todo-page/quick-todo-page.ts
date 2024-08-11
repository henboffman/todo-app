import { ActionItemPriority } from '../../models/action-item';
import * as bootstrap from 'bootstrap';

export class QuickTodoPage {
	private todoValue: string = "";
	private dueDate: string = "";
	private priority: string = "Medium";
	private isExpanded: boolean = false;
	private priorities: string[];

	constructor() {
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

			this.showSuccessToast();

			this.todoValue = "";
			this.dueDate = "";
			this.priority = "Medium";
			this.isExpanded = false;
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