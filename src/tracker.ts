import * as obsidian from 'obsidian';

export type EventType = 'open' | 'delete';

interface FileEvent {
	path: string;
	ts: number;
	isoDate: string;
	vaultName: string;
	eventType: EventType;
}

function uuidv7(): string {
	const now = Date.now();
	const tsHigh = Math.floor(now / 0x10000);
	const tsLow = now & 0xffff;

	const bytes = new Uint8Array(10);
	window.crypto.getRandomValues(bytes);

	const randA = (((bytes[0] ?? 0) & 0x0f) << 8) | (bytes[1] ?? 0);
	const variantByte = ((bytes[2] ?? 0) & 0x3f) | 0x80;
	const p4 = variantByte.toString(16).padStart(2, '0') + (bytes[3] ?? 0).toString(16).padStart(2, '0');
	const p5 = Array.from(bytes.slice(4)).map(b => b.toString(16).padStart(2, '0')).join('');

	return [
		tsHigh.toString(16).padStart(8, '0'),
		tsLow.toString(16).padStart(4, '0'),
		(0x7000 | randA).toString(16),
		p4,
		p5,
	].join('-');
}

export function record(app: obsidian.App, file: obsidian.TFile, eventType: EventType): void {
	const now = Date.now();
	const event: FileEvent = {
		path: file.path,
		ts: now,
		isoDate: new Date(now).toISOString(),
		vaultName: app.vault.getName(),
		eventType,
	};
	const filename = `tundratoad-${uuidv7()}.json`;
	app.vault.adapter.write(filename, JSON.stringify(event, null, 2) + '\n').catch(console.error);
}
