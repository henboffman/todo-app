// filter-dialog.ts
import { DialogController } from '@aurelia/dialog';
import { inject } from 'aurelia';

@inject(DialogController)
export class TableFilterDialog {
    field: string;
    distinctValues: string[];
    selectedValues: Set<string>;

    constructor(private dialogController: DialogController) {
        this.selectedValues = new Set();
    }

    activate(model: { field: string; distinctValues: string[]; currentFilter: string[] }) {
        this.field = model.field;
        this.distinctValues = model.distinctValues;
        this.selectedValues = new Set(model.currentFilter);
    }

    toggleValue(value: string) {
        if (this.selectedValues.has(value)) {
            this.selectedValues.delete(value);
        } else {
            this.selectedValues.add(value);
        }
    }

    apply() {
        this.dialogController.ok(Array.from(this.selectedValues));
    }

    cancel() {
        this.dialogController.cancel();
    }
}