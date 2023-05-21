import { App, PluginSettingTab, Setting } from "obsidian";
import revealExplorerFile from "src/main";
import DuplicateTabs from "src/main";

export class revealExplorerFileSettingsTab extends PluginSettingTab {
	plugin: revealExplorerFile;

	constructor(app: App, plugin: DuplicateTabs) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h1", { text: "Reveal Explorer File" });
		const content =
			`<p>Repository: 🌴 <a href="https://github.com/1C0D/Obsidian-Reveal-File-in-explorer">1C0D/Obsidian-Reveal-File-in-explorer</a> 🌴</p>`;
		containerEl.createDiv("", (el: HTMLDivElement) => {
			el.innerHTML = content;
		});

		containerEl.createEl("h4", { text: "On header title clicking" });

		this.createToggle(
			containerEl,
			"Fold when clicking title",
			"When clicking title, close all folders where the file is not in",
			"foldOtherDirsBefore"
		);

		containerEl.createEl("h4", { text: "On file opening" });

		this.createToggle(
			containerEl,
			"Reveal when opening file",
			"When opening a file, it will reveal it",
			"revealOnOpen",
			true
		);

		if (this.plugin.settings.revealOnOpen) {
			this.createToggle(
				containerEl,
				"Fold when opening file",
				"When opening a file, it will also fold other folders",
				"foldWhenOpen"
			);

			this.createToggle(
				containerEl,
				"Enable Reveal when opening file from Explorer",
				"If disabled, the reveal will only happen using quick switcher",
				"enableRevealExplorer"
			);

			// option later ?
			// containerEl.createEl("h3", { text: "File Exclusions" });

			// new Setting(containerEl)
			// 	.setName("Enable Excluded Directories")
			// 	.setDesc("")
			// 	.addToggle((toggle) => {
			// 		toggle
			// 			// Create a toggle for the setting
			// 			.setValue(this.plugin.settings.enableExclude)
			// 			.onChange((value) => {
			// 				// Update the plugin setting when the toggle is changed
			// 				this.plugin.settings.enableExclude = value;
			// 				this.plugin.saveSettings();
			// 				this.plugin.reveal();
			// 			});
			// 	});

			// new Setting(containerEl)
			// 	.setName("Excluded Directories on Opening Files")
			// 	.setDesc("If you want some files not to be revealed when opening them")
			// 	.addButton(cb => {
			// 		cb.setButtonText("Manage");
			// 		cb.onClick((evt: MouseEvent) => {
			// 			// new ExcludedFilesModal(this.app, this.plugin.settings,
			// 			// 	async (filters: string[]) => {
			// 			// 		this.plugin.settings.excludedFilesFilters = filters;
			// 			// 		await this.plugin.saveSettings();
			// 			// 		this.display();
			// 			// 	})
			// 			// 	.open();
			// 		})
			// 	});
		}
	}

	private createToggle(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		prop: string,
		display?: boolean
	) {
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle((bool) =>
				bool
					.setValue((this.plugin.settings as any)[prop] as boolean)
					.onChange(async (value) => {
						(this.plugin.settings as any)[prop] = value;
						await this.plugin.saveSettings();
						this.plugin.reveal();
						if (display) {
							this.display()
						}
					})
			);
	}
}