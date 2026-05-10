import * as obsidian from 'obsidian';
import * as tracker from './tracker';

export default class TundraToadPlugin extends obsidian.Plugin {
	async onload(): Promise<void> {
		this.registerEvent(
			this.app.workspace.on('file-open', (file: obsidian.TFile | null) => {
				if (!file) return;
				tracker.record(this.app, file, 'open');
			})
		);

		this.registerEvent(
			this.app.vault.on('delete', (file: obsidian.TAbstractFile) => {
				if (!(file instanceof obsidian.TFile)) return;
				tracker.record(this.app, file, 'delete');
			})
		);

		this.registerEvent(
			this.app.vault.on('rename', (file: obsidian.TAbstractFile, oldPath: string) => {
				if (!(file instanceof obsidian.TFile)) return;
				tracker.record(this.app, file, 'rename', oldPath);
			})
		);
	}
}
