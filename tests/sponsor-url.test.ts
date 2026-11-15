// s1113a L1: the own adapter of secret-parcel must open the NoteMods $15 one-time tier, like the shared license package.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, Setting } from 'obsidian-test-mocks/obsidian';
import manifest from '../manifest.json';
import { SPONSORS } from '../src/pro';
import { createGitHubSponsors, fillGetProSetting, showProNotice } from '../src/sponsors-adapter';

const WANT = 'https://github.com/sponsors/theluckystrike/sponsorships?tier_id=666162&frequency=one-time&metadata_source=secret-parcel-all';
const UI = { proSummary: 'Pro adds saved export profiles.', priceText: 'Sponsor $5 a month, or $15 once.' };

function manager() {
	const app = App.createConfigured__({ files: {} });
	return createGitHubSponsors(app as never, manifest.id, SPONSORS, { register: () => undefined });
}

describe('secret-parcel Sponsor URL', () => {
	afterEach(() => vi.restoreAllMocks());

	it('the Get pro row opens the $15 one-time tier with metadata_source=<plugin id>-all', () => {
		expect(manifest.id).toBe('secret-parcel');
		const pro = manager();
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		const setting = new Setting(document.createElement('div'));
		fillGetProSetting(setting as never, pro, UI);
		setting.controlEl.querySelector('button')?.click();
		expect(open.mock.calls).toEqual([[WANT]]);
	});

	it('the Pro notice button opens the same URL', () => {
		const pro = manager();
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		const g = globalThis as unknown as { createFragment: (cb: (f: DocumentFragment) => void) => DocumentFragment };
		const real = g.createFragment;
		const made: DocumentFragment[] = [];
		vi.spyOn(g, 'createFragment').mockImplementation((cb) => {
			const f = real(cb);
			made.push(f);
			return f;
		});
		expect(showProNotice(pro, 'Backups are part of Pro.')).not.toBeNull();
		const button = made.at(-1)?.querySelector('button.pf-pro-notice-sponsor') as HTMLButtonElement | null | undefined;
		expect(button?.textContent).toBe('Sponsor on GitHub');
		button?.click();
		expect(open.mock.calls).toEqual([[WANT]]);
	});
});
