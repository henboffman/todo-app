
import { inject } from "aurelia";
import { Modal } from "bootstrap";
import { ThemeService } from "../../services/theme-service";

@inject(ThemeService)
export class SettingsSidebar {
    private dataToImport: string = "";

    constructor(private themeService: ThemeService) { }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }

    // async importData(): Promise<void> {
    //     if (this.dataToImport) {
    //         await this.notesService.importNotesAndCollections(this.dataToImport, this.skipDuplicates);
    //         this.dataToImport = '';
    //     }
    // }

}