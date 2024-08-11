// src/dialogs/column-select-dialog/column-select-dialog.ts

import { DialogController } from '@aurelia/dialog';
import { ActionItem } from '../../models/action-item';
import { inject } from 'aurelia';

@inject(DialogController)
export class ColumnSelectDialog {
    columns: { key: keyof ActionItem; name: string; selected: boolean; order: number }[] = [
        { key: 'title', name: 'Title', selected: true, order: 1 },
        { key: 'status', name: 'Status', selected: true, order: 2 },
        { key: 'dueDate', name: 'Due Date', selected: true, order: 3 },
        { key: 'priority', name: 'Priority', selected: true, order: 4 },
        { key: 'context', name: 'Context', selected: true, order: 5 },
        { key: 'description', name: 'Description', selected: false, order: 6 },
        { key: 'project', name: 'Project', selected: false, order: 7 },
        { key: 'tags', name: 'Tags', selected: false, order: 8 },
        { key: 'estimatedTime', name: 'Estimated Time', selected: false, order: 9 },
        { key: 'actualTime', name: 'Actual Time', selected: false, order: 10 },
        { key: 'recurring', name: 'Recurring', selected: false, order: 11 },
        { key: 'assignedTo', name: 'Assigned To', selected: false, order: 12 },
        { key: 'createdDate', name: 'Created Date', selected: false, order: 13 },
        { key: 'updatedDate', name: 'Updated Date', selected: false, order: 14 },
        { key: 'completedDate', name: 'Completed Date', selected: false, order: 15 },
        { key: 'notes', name: 'Notes', selected: false, order: 16 },
        { key: 'energy', name: 'Energy', selected: false, order: 17 },
        { key: 'whoFor', name: 'Who For?', selected: false, order: 18 },
    ];


    draggedItem: any = null;
    dragOverItem: any = null;

    constructor(private dialogController: DialogController) { }

    attached() {
        const savedColumns = localStorage.getItem('actionItemColumns');
        if (savedColumns) {
            this.columns = JSON.parse(savedColumns);
        }
        this.columns.sort((a, b) => a.order - b.order);
    }

    dragStart(event: DragEvent, item: any) {
        this.draggedItem = item;
        event.dataTransfer!.effectAllowed = 'move';
        event.dataTransfer!.setData('text/plain', ''); // Required for Firefox
    }

    dragOver(event: DragEvent, item: any) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
        this.dragOverItem = item;
    }

    dragLeave(event: DragEvent) {
        this.dragOverItem = null;
    }

    drop(event: DragEvent, target: any) {
        event.preventDefault();
        if (this.draggedItem !== target) {
            const draggedIndex = this.columns.indexOf(this.draggedItem);
            const targetIndex = this.columns.indexOf(target);
            this.columns.splice(draggedIndex, 1);
            this.columns.splice(targetIndex, 0, this.draggedItem);
            this.updateOrder();
        }
        this.draggedItem = null;
        this.dragOverItem = null;
    }

    updateOrder() {
        this.columns.forEach((column, index) => {
            column.order = index + 1;
        });
    }

    save() {
        localStorage.setItem('actionItemColumns', JSON.stringify(this.columns));
        this.dialogController.ok(this.columns);
    }

    cancel() {
        this.dialogController.cancel();
    }
}
