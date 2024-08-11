// app.ts
import { IRoute, IRouteableComponent } from '@aurelia/router';
import { inject } from 'aurelia';
import { ThemeService } from './services/theme-service';

@inject(ThemeService)
export class App implements IRouteableComponent {
	static routes: IRoute[] = [
		{
			path: '',
			component: () => import('./routes/home/home').then(m => m.Home),
			title: 'Home'
		},
		{
			path: 'quick-todo',
			component: () => import('./routes/quick-todo-page/quick-todo-page').then(m => m.QuickTodoPage),
			title: 'Quick Todo'
		}
		// Add more routes as needed
	];

	private sidebarIcons = [
		// { icon: 'bi-layout-sidebar', action: 'toggleLeftSidebar', tooltip: 'Toggle Sidebar' },
		// { icon: 'bi-home', action: 'toggleNavigation', tooltip: 'Navigation' },
		{ icon: 'bi-gear', action: 'activateSettingsSidebar', tooltip: 'Settings' },
	];

	private activeSection = '';
	private leftSidebarVisible = false;

	private contentSections = {
		navigation: { visible: false, component: 'navigation-component', tooltip: "Toggle Sidebar" },
		settings: { visible: false, component: 'settings-sidebar', tooltip: "Settings" }
	};

	constructor(private themeService: ThemeService) {
		this.contentSections.settings.visible = true;
	}

	handleSidebarAction(action: string) {
		console.log(action);
		this[action]();
		this.activeSection = action;
	}

	toggleLeftSidebar() {
		this.leftSidebarVisible = !this.leftSidebarVisible;
	}

	toggleNavigation() {
		this.contentSections.settings.visible = false;
		this.contentSections.navigation.visible = true;
		if (!this.leftSidebarVisible) {
			this.leftSidebarVisible = true;
		}
	}

	activateSettingsSidebar() {
		this.contentSections.navigation.visible = false;
		this.contentSections.settings.visible = true;
		if (!this.leftSidebarVisible) {
			this.leftSidebarVisible = true;
		}
	}
}