import fetch from "node-fetch";

export interface VMResponse {
	session_id: string;
	embed_url: string;
	admin_token: string;
	termination_date: string | null;
}

export interface VMRequestBody {
	start_url?: string;
	kiosk?: boolean;
	offline_timeout?: number | null;
	control_disable_default?: boolean;
	region?: "NA" | "EU" | "AS";
	profile?: { load?: string; save?: boolean; };
	ublock?: boolean;
	extension?: { field: string; };
	webgl?: boolean;
	width?: number;
	height?: number;
	fps?: number;
	hide_cursor?: boolean;
}

export default class HyperbeamAPI {
	private apiKey: string;
	private environment: "testing" | "production" = "testing";
	private searchProvider: "duckduckgo" | "google" = "google";

	constructor(apiKey: string, environment: "testing" | "production") {
		this.apiKey = apiKey;
		this.environment = environment;
	}

	setSearchProvider(searchProvider: "duckduckgo" | "google") {
		this.searchProvider = searchProvider;
	}

	getSearchUrl(query: string): string {
		const searchUrls = {
			duckduckgo: "https://duckduckgo.com/?q=",
			google: "https://google.com/search?q=",
		};
		return `${searchUrls[this.searchProvider]}${encodeURIComponent(query)}`;
	}

	private get baseUrl(): string {
		return `https://${this.environment === "production" ? "engine" : "enginetest"}.hyperbeam.com/v0`;
	}

	private async request({ path, method, body }: { path: string, method: string, body?: any; }): Promise<any> {
		const headers = { "Authorization": `Bearer ${this.apiKey}` };
		const response = await fetch(`${this.baseUrl}${path}`, {
			method,
			headers,
			body: JSON.stringify(body),
		});
		if (!response.ok)
			throw new Error(`${response.status} ${response.statusText}`);
		return response.json();
	}

	async createSession(sessionData: VMRequestBody = {}): Promise<VMResponse> {
		const body: VMRequestBody = {
			...sessionData,
			offline_timeout: 300,
			start_url: sessionData?.start_url
				? this.hasProtocol(sessionData.start_url)
					? sessionData.start_url
					: this.getSearchUrl(sessionData.start_url)
				: `https://${this.searchProvider}.com`,
		};
		return this.request({ path: "/vm", method: "POST", body }) as Promise<VMResponse>;
	}

	private hasProtocol(s: string): boolean {
		try {
			const url = new URL(s);
			return url.protocol === "https:" || url.protocol === "http:";
		} catch (e) {
			return false;
		}
	}
}