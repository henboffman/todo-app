import { DialogController } from "@aurelia/dialog";
import { inject } from "aurelia";

@inject(DialogController)
export class QuickTodoDialog {

    private todoValue: string = "";
    private dialogElement: HTMLElement;

    constructor(private dialogController: DialogController) { }

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
        this.dialogController.ok(this.todoValue);
    }

    cancel() {
        this.dialogController.cancel();
    }
}