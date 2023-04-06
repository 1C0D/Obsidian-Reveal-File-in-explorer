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
		const linkText = containerEl.createEl("span", {
			text: " 🌴",
		});
		const linkContainer = containerEl.createEl("p", {
			text: "Repository: 🌴 ",
		});
		linkContainer.createEl("a", {
			text: "1C0D/Obsidian-Reveal-File-in-explorer",
			href: "https://github.com/1C0D/Obsidian-Reveal-File-in-explorer",
		});
		linkContainer.appendChild(linkText);

		new Setting(containerEl)
			.setName("Fold other folders before")
			.setDesc(
				"This is closing all folders where the file is not in" +
					" to improve visibility"
			)
			.addToggle((toggle) => {
				toggle
					// Create a toggle for the setting
					.setValue(this.plugin.settings.foldOtherDirsBefore)
					.onChange((value) => {
						// Update the plugin setting when the toggle is changed
						this.plugin.settings.foldOtherDirsBefore = value;
						this.plugin.saveSettings();
					});
			});
	}
}
