import { Plugin, TFile, TFolder, View } from "obsidian";
import { revealExplorerFileSettingsTab } from "./settings";

interface revealExplorerFileSettings {
	foldOtherDirsBefore: boolean;
	revealOnOpen: boolean;
	foldWhenOPen: boolean;
}

const DEFAULT_SETTINGS: revealExplorerFileSettings = {
	foldOtherDirsBefore: true,
	revealOnOpen: false,
	foldWhenOPen: false,
};

export default class revealExplorerFile extends Plugin {
	settings: revealExplorerFileSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new revealExplorerFileSettingsTab(this.app, this));
		this.app.workspace.onLayoutReady(() => {
			this.reveal();
		});
	}

	reveal = () => {
		const containerEl = this.app.workspace.containerEl.win; //win to work on multi windows
		this.registerDomEvent(containerEl, "click", this.clickHandler);
		this.app.workspace.on("file-open", async () => {
			if (this.settings.revealOnOpen) {
				if (this.settings.foldWhenOPen) this.fold();
				await (this.app as any).commands.executeCommandById(
					"file-explorer:reveal-active-file"
				);
			}
		});
	};

	clickHandler = async (evt: any) => {
		if (evt.target.classList.contains("view-header-title")) {
			// don't trigger on New tab
			const { workspace } = this.app;
			const activeView = workspace.getActiveViewOfType(View);
			const isNewTab = activeView?.getDisplayText() === "New tab";
			if (isNewTab) return

			if (this.settings.foldOtherDirsBefore) {
				this.fold();
			}
			await (this.app as any).commands.executeCommandById(
				"file-explorer:reveal-active-file"
			);
		}
	};

	fold = async () => {
		const fileExplorer = this.app.workspace
			.getLeavesOfType("file-explorer")
			?.first();
		if (!fileExplorer) {
			return;
		}

		function isFolder(file: TFile | TFolder): file is TFolder {
			return file instanceof TFolder;
		}
		const files = Object.entries((fileExplorer.view as any).fileItems);
		for (const [path, fileItem] of files) {
			if (path === "/") continue; // don't collapse root
			// Collapse folder
			const isFold = isFolder((fileItem as any).file);
			if (isFold) {
				(fileItem as any).setCollapsed(true);
			}
		}
	};

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
