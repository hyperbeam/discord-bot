import { hbApiRequest } from "../utils/helpers";

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

export default class HbRestAPI {
	private apiKey: string;
	private searchProvider: "duckduckgo" | "google" = "google";
	private baseUrl = "https://engine.hyperbeam.com/v0";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
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

	async createSession(sessionData: VMRequestBody = {}): Promise<VMResponse> {
		const body: VMRequestBody = {
			...sessionData,
			control_disable_default: true,
			offline_timeout: 300,
			start_url: sessionData?.start_url
				? this.hasProtocol(sessionData.start_url)
					? sessionData.start_url
					: this.getSearchUrl(sessionData.start_url)
				: `https://${this.searchProvider}.com`,
		};
		return hbApiRequest<VMResponse, VMRequestBody>({
			baseUrl: this.baseUrl,
			authBearer: this.apiKey,
			path: "/vm",
			method: "POST",
			body,
		});
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