import * as obsidian from 'obsidian';

export type EventType = 'open' | 'delete' | 'rename';

interface DeviceInfo {
	platform: 'desktop' | 'mobile';
	formFactor: 'phone' | 'tablet' | 'desktop';
	os: 'android' | 'ios' | 'macos' | 'windows' | 'linux' | 'unknown';
	userAgent: string;
}

interface FileEvent {
	path: string;
	fromPath?: string;
	toPath?: string;
	ts: number;
	isoDate: string;
	vaultName: string;
	eventType: EventType;
	device: DeviceInfo;
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

function deviceInfo(): DeviceInfo {
	const p = obsidian.Platform;
	let os: DeviceInfo['os'] = 'unknown';
	if (p.isAndroidApp) os = 'android';
	else if (p.isIosApp) os = 'ios';
	else if (p.isMacOS) os = 'macos';
	else if (p.isWin) os = 'windows';
	else if (p.isLinux) os = 'linux';

	return {
		platform: p.isDesktop ? 'desktop' : 'mobile',
		formFactor: p.isPhone ? 'phone' : p.isTablet ? 'tablet' : 'desktop',
		os,
		userAgent: navigator.userAgent,
	};
}

export function record(app: obsidian.App, file: obsidian.TFile, eventType: EventType, oldPath?: string): void {
	if (file.name.startsWith('tundratoad-')) return;
	const now = Date.now();
	const event: FileEvent = {
		path: file.path,
		ts: now,
		isoDate: new Date(now).toISOString(),
		vaultName: app.vault.getName(),
		eventType,
		device: deviceInfo(),
	};
	if (eventType === 'rename' && oldPath !== undefined) {
		event.fromPath = oldPath;
		event.toPath = file.path;
	}
	const filename = `tundratoad-${uuidv7()}.json`;
	app.vault.adapter.write(filename, JSON.stringify(event, null, 2) + '\n').catch(console.error);
}
