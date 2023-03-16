import { Plugin } from "obsidian";

export default class MyPlugin extends Plugin {
	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.workspace.on("active-leaf-change", () => {
					const containerEl = this.app.workspace.containerEl.win; //win to work on multi windows 
					this.registerDomEvent(
						containerEl,
						"click",
						this.clickHandler
					);
				})
			);
		});
	}

	clickHandler = async (evt: any) => {
		if (evt.target.classList.contains("view-header-title")) {
			await (this.app as any).commands.executeCommandById(
				"file-explorer:reveal-active-file"
			);
		}
	};
}