import { Plugin, TFile, TFolder, View } from "obsidian";
import { revealExplorerFileSettingsTab } from "./settings";

interface revealExplorerFileSettings {
	foldOtherDirsBefore: boolean;
	revealOnOpen: boolean;
	foldWhenOpen: boolean;
}

const DEFAULT_SETTINGS: revealExplorerFileSettings = {
	foldOtherDirsBefore: true,
	revealOnOpen: false,
	foldWhenOpen: false,
};

export default class revealExplorerFile extends Plugin {
	settings: revealExplorerFileSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new revealExplorerFileSettingsTab(this.app, this));
		this.app.workspace.onLayoutReady(() => {
			// this.registerEvent(
			this.reveal();
		});
	}

	reveal = () => {
		const { workspace } = this.app;
		const containerEl = workspace.containerEl.win; //win to work on multi windows
		this.registerDomEvent(containerEl, "click", this.clickHandler);
		workspace.on("file-open", async () => {
			if (this.settings.revealOnOpen) {
				if (!this.is_file_explorer_open()) return;
				const activeView = workspace.getActiveViewOfType(View);
				if (
					!activeView ||
					!(activeView as any).sourceMode ||
					!(activeView as any).sourceMode.cmEditor
				) {
					return;
				}
				const cmEditor = (activeView as any)?.sourceMode.cmEditor;
				const cursor = cmEditor.getCursor();

				if (this.settings.foldWhenOpen) await this.fold();
				await (this.app as any).commands.executeCommandById(
					"file-explorer:reveal-active-file"
				);

				await (this.app as any).commands.executeCommandById(
					"editor:focus"
				);


				const titleContainerEl =
					activeView?.containerEl?.querySelector(
						".view-header-title"
					);
				
				if (titleContainerEl instanceof HTMLElement) {
					setTimeout(async() => {
						titleContainerEl.focus();
						cmEditor.setCursor(cursor);
						cmEditor.focus();
					}, 50);
				}
			}
		});
	};

	clickHandler = async (evt: any) => {
		if (evt.target?.classList.contains("view-header-title")) {
			// don't trigger on New tab
			const { workspace } = this.app;
			const activeView = workspace.getActiveViewOfType(View);
			const isNewTab = activeView?.getDisplayText() === "New tab";
			if (isNewTab) return;

			if (this.settings.foldOtherDirsBefore) {
				await this.fold();
			}
			await (this.app as any).commands.executeCommandById(
				"file-explorer:reveal-active-file"
			);

			await (this.app as any).commands.executeCommandById("editor:focus");

			const titleContainerEl =
				activeView?.containerEl?.querySelector(".view-header-title");
			if (titleContainerEl instanceof HTMLElement) {
				setTimeout(() => titleContainerEl.focus(), 50);
			}
		}
	};

	fold = async () => {
		const { workspace } = this.app;
		const fileExplorer = workspace
			.getLeavesOfType("file-explorer")
			?.first();
		if (!fileExplorer) {
			return;
		}
		const activeView = workspace.getActiveViewOfType(View);
		if (activeView?.getDisplayText() === "New tab") return;

		function isFolder(file: TFile | TFolder): file is TFolder {
			return file instanceof TFolder;
		}
		const files = Object.entries((fileExplorer.view as any).fileItems);
		for (const [path, fileItem] of files) {
			if (path === "/") continue; // don't collapse root
			// Collapse folder
			const isFold = isFolder((fileItem as any).file);
			if (isFold) {
				await (fileItem as any).setCollapsed(true);
			}
		}
	};

	//seeking for <div class="workspace-tab-header is-active" draggable="true" aria-label="Files" aria-label-delay="300" data-type="file-explorer">
	// so elts <div> with attr data-type = "file-explorer" and with a class "is-active".
	// isFileExplorerActive(): boolean {
	// 	const el = document.querySelector(
	// 		'div[data-type="file-explorer"].is-active'
	// 	);
	// 	return el !== null;
	// }

	//better https://github.com/shichongrui/obsidian-reveal-active-file/blob/master/main.ts
	is_file_explorer_open(): boolean {
		const workspace = this.app.workspace;
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
