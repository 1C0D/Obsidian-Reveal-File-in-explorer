import { Plugin, TFile, TFolder, View } from "obsidian";
import { revealExplorerFileSettingsTab } from "./settings";

interface revealExplorerFileSettings {
	foldOtherDirsBefore: boolean;
	revealOnOpen: boolean;
	foldWhenOpen: boolean;
	// enableExclude: boolean;
	excludedFolders: string,
	enableRevealExplorer: boolean;
}

const DEFAULT_SETTINGS: revealExplorerFileSettings = {
	foldOtherDirsBefore: true,
	revealOnOpen: true,
	foldWhenOpen: true,
	// enableExclude: false,
	excludedFolders: "",
	enableRevealExplorer: true
};

export default class revealExplorerFile extends Plugin {
	settings: revealExplorerFileSettings;
	disableRevealExplorer = false

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new revealExplorerFileSettingsTab(this.app, this));
		this.app.workspace.onLayoutReady(() => {
			this.reveal();
		});
	}

	reveal = () => {
		const { workspace } = this.app;
		const containerEl = workspace.containerEl.win; //win -> multi windows
		// view-header-title click
		this.registerDomEvent(containerEl, "click", this.clickHandler, true);//true to intercept event target if click in explorer
		this.registerEvent(
			workspace.on("file-open", this.onFileOpen
			))
	};

	onFileOpen = async () => {
		if (this.settings.revealOnOpen && !this.disableRevealExplorer) {
			const { workspace } = this.app;
			const activeView = workspace.getActiveViewOfType(View);
			// added a fix on *.table for the plugin Notion like table. bug with the obsidian reveal command
			const path = activeView!.leaf.getViewState().state.file
			console.log("activeView!.leaf.getViewState().state.file", activeView!.leaf.getViewState().state.file)
			if (!this.is_view_explorer_open() || this.pathIsExcluded(path) || path?.endsWith(".table")) {
				return;
			}

			if (this.settings.foldWhenOpen) {
				await this.fold();
			}
			// apparently the reveal fails sometime
			const revealPromise1 = (this.app as any).commands.executeCommandById("file-explorer:reveal-active-file");
			const revealPromise2 = (this.app as any).commands.executeCommandById("file-explorer:reveal-active-file");
			await Promise.all([revealPromise1, revealPromise2]);
			// focus on active leaf
			setTimeout(async () => {
				this.app.workspace.setActiveLeaf(activeView!.leaf, {
					focus: true,
				});
			}
				, 50);
		} else {
			setTimeout(async () => {
				this.disableRevealExplorer = false
			}, 200);
		}
	}

	clickHandler = async (evt: any) => {
		const clickedElement = evt.target;
		// if click on a file in explorer
		const isFileExplorer =
			clickedElement.classList.contains("tree-item-self")
			&& clickedElement.classList.contains("nav-file-title")
			|| clickedElement.classList.contains("tree-item-inner")
			&& clickedElement.classList.contains("nav-file-title-content")

		if (clickedElement?.classList.contains("view-header-title")) {
			// don't trigger on New tab
			const { workspace } = this.app;
			const activeView = workspace.getActiveViewOfType(View);
			const isNewTab = activeView?.getDisplayText() === "New tab";
			if (isNewTab) {
				return;
			}

			if (this.settings.foldOtherDirsBefore) {
				await this.fold();
			}
			await (this.app as any).commands.executeCommandById(
				"file-explorer:reveal-active-file"
			);
			await (this.app as any).commands.executeCommandById("editor:focus");

			const titleContainerEl =
				activeView?.containerEl?.querySelector(".view-header-title");
			setTimeout(() => {
				(titleContainerEl as any)?.focus();
			}, 50);
		}
		else if (this.settings.revealOnOpen && !this.settings.enableRevealExplorer && isFileExplorer) {
			this.disableRevealExplorer = true
			const { parentElement } = clickedElement;
			if (parentElement) {
				const clickEvent = new Event("click");
				parentElement.dispatchEvent(clickEvent);
			}
		}
	};

	fold = async () => {
		const { workspace } = this.app;
		const fileExplorer = workspace
			.getLeavesOfType("file-explorer")
			?.first();
		// don't trigger on New tab
		const activeView = workspace.getActiveViewOfType(View);
		if (activeView?.getDisplayText() === "New tab") {
			return;
		}

		const files = Object.entries((fileExplorer?.view as any).fileItems);
		for (const [path, fileItem] of files) {
			// don't collapse root
			if (path === "/") {
				continue;
			}
			// collapse folders
			const isFold = (fileItem as any).file instanceof TFolder;
			if (isFold) {
				await (fileItem as any).setCollapsed(true);
			}
		}
	};

	is_view_explorer_open(): boolean {
		const { workspace } = this.app;
		let is_open = false;
		workspace.iterateAllLeaves((leaf) => {
			if (
				leaf.getViewState().type == "file-explorer" &&
				(leaf as any).width > 0
			) {
				is_open = true;
			}
		});
		return is_open;
	}

	pathIsExcluded(path: string): boolean {
		const excludedFolders = this.settings.excludedFolders;
		if (!this.settings.revealOnOpen || !excludedFolders) return false;
		const newList = excludedFolders.split(",").map(x => x.trim().replace(/^\/+|\/+$/g, "")).filter(x => x !== "");
		return newList.some(value => path?.startsWith(value));
	}

	async loadSettings() {
	this.settings = Object.assign(
		{},
		DEFAULT_SETTINGS,
		await this.loadData()
	);
}

	async saveSettings() {
	await this.saveData(this.settings);
}
}
