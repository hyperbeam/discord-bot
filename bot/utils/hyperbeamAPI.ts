import { VMRequestBody, VMResponse } from "./../hyperbeamAPI.d";

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