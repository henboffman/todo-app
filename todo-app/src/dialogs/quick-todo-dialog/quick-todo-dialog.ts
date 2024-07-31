import { ActionItemPriority, ActionItemStatus } from './../../models/action-item';
import { DialogController } from "@aurelia/dialog";
import { inject } from "aurelia";

@inject(DialogController)
export class QuickTodoDialog {
    private todoValue: string = "";
    private dueDate: string = "";
    private priority: string = "Medium";
    private dialogElement: HTMLElement;
    private isExpanded: boolean = false;

    private statuses: string[];
    private priorities: string[];

    constructor(private dialogController: DialogController) {

        this.statuses = Object.values(ActionItemStatus);
        this.priorities = Object.values(ActionItemPriority);
    }

    attached() {
        document.getElementById("todo-input").focus();
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.dialogElement = document.querySelector('.quick-todo-dialog') as HTMLElement;
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.todoValue !== "") {
            return this.close();
        }
    }

    async close() {
        this.dialogElement.classList.add('closing');
        await new Promise(resolve => setTimeout(resolve, 250));
        // this.dialogController.ok(this.todoValue);
        this.dialogController.ok({
            title: this.todoValue,
            dueDate: this.dueDate,
            priority: this.priority
        });
        // this.dialogController.ok({
        //     title: this.todoValue,
        //     dueDate: this.dueDate,
        //     priority: this.priority
        // });
    }

    cancel() {
        this.dialogController.cancel();
    }

    async toggleExpand() {
        if (this.isExpanded) {
            this.isExpanded = false;
        } else {
            // Add a small delay before expanding to allow the animation to start
            await new Promise(resolve => setTimeout(resolve, 10));
            this.isExpanded = true;
        }
    }
}