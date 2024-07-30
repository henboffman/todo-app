export class ThemeService {
    private readonly THEME_KEY = 'theme';
    private readonly DARK_MODE_CLASS = 'dark-mode';
    private readonly LIGHT_MODE_CLASS = 'light-mode';

    constructor() {
        this.loadThemeFromStorage();
    }

    toggleTheme() {
        document.body.classList.toggle(this.DARK_MODE_CLASS);
        document.body.classList.toggle(this.LIGHT_MODE_CLASS);
        this.saveThemeToStorage();
        console.log('Theme toggled', document.body.classList.contains(this.DARK_MODE_CLASS) ? 'dark' : 'light');
    }

    private saveThemeToStorage() {
        const isDarkMode = document.body.classList.contains(this.DARK_MODE_CLASS);
        localStorage.setItem(this.THEME_KEY, isDarkMode ? 'dark' : 'light');
    }

    private loadThemeFromStorage() {
        const storedTheme = localStorage.getItem(this.THEME_KEY);
        if (storedTheme === 'dark') {
            document.body.classList.add(this.DARK_MODE_CLASS);
            document.body.classList.remove(this.LIGHT_MODE_CLASS);
        }
    }
}