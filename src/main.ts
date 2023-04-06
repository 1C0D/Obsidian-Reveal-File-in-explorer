import { Plugin, TFile, TFolder } from "obsidian";
import { revealExplorerFileSettingsTab } from "./settings";

interface revealExplorerFileSettings {
	foldOtherDirsBefore: boolean;
}

const DEFAULT_SETTINGS: revealExplorerFileSettings = {
	foldOtherDirsBefore: true,
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
	};

	clickHandler = async (evt: any) => {
		if (evt.target.classList.contains("view-header-title")) {
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

		const files = Object.entries((fileExplorer.view as any).fileItems);
		for (const [path, fileItem] of files) {
			if (path === "/") continue; // don't collapse root
			function isFolder(file: TFile | TFolder): file is TFolder {
				return file instanceof TFolder;
			}
			// // - Collapse all folder item
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
