import { PermissionData } from "@hyperbeam/web";

export type VMResponse = {
	session_id: string;
	embed_url: string;
	admin_token: string;
	termination_date?: string | null;
};

export type VMRequestBody = {
	start_url?: string;
	kiosk?: boolean;
	offline_timeout?: number | null;
	control_disable_default?: boolean;
	region?: "NA" | "EU" | "AS";
	profile?: { load?: string; save?: boolean };
	ublock?: boolean;
	extension?: { field: string };
	webgl?: boolean;
	width?: number;
	height?: number;
	fps?: number;
	hide_cursor?: boolean;
};

type RequestProps = {
	path: string;
	method: Required<RequestInit["method"]>;
	baseUrl: string;
	headers?: RequestInit["headers"];
	authorization: string;
	returnRawResponse?: boolean;
};

async function HbFetch<ResponseType, RequestBody = any>(
	props: RequestProps & { body?: RequestBody },
): Promise<ResponseType> {
	const headers = { Authorization: `Bearer ${props.authorization}` };
	const response = await fetch(`${props.baseUrl}${props.path}`, {
		method: props.method,
		headers: { ...headers, ...(props.headers || {}) },
		body: props.body ? JSON.stringify(props.body) : undefined,
	});
	if (props.returnRawResponse) return response as unknown as ResponseType;
	else {
		let result;
		try {
			result = await response.json();
		} catch (e) {
			result = await response.text();
			throw new Error(`Failed to parse response as JSON:\n${result}`);
		}
		if (response.ok) return result as unknown as ResponseType;
		else throw new Error(`${response.status} ${response.statusText}\n${result.code}:${result.message}`);
	}
}

export class HyperbeamAPI {
	private apiKey = process.env.HB_API_KEY;
	private searchProvider: "duckduckgo" | "google" = "google";
	private baseUrl = "https://engine.hyperbeam.com/v0";

	private hasProtocol(s: string): boolean {
		try {
			const url = new URL(s);
			return url.protocol === "https:" || url.protocol === "http:";
		} catch (e) {
			return false;
		}
	}

	private getSearchUrl(query: string): string {
		const searchUrls = {
			duckduckgo: "https://duckduckgo.com/?q=",
			google: "https://google.com/search?q=",
		};
		return `${searchUrls[this.searchProvider]}${encodeURIComponent(query)}`;
	}

	setSearchProvider(searchProvider: HyperbeamAPI["searchProvider"]): void {
		this.searchProvider = searchProvider;
	}

	async createSession(sessionData: VMRequestBody = {}): Promise<HyperbeamSession> {
		const body: VMRequestBody = {
			...sessionData,
			control_disable_default: false,
			offline_timeout: 300,
			ublock: true,
			start_url: sessionData?.start_url
				? this.hasProtocol(sessionData.start_url)
					? sessionData.start_url
					: this.getSearchUrl(sessionData.start_url)
				: `https://${this.searchProvider}.com`,
		};
		return HbFetch<VMResponse, VMRequestBody>({
			baseUrl: this.baseUrl,
			authorization: this.apiKey,
			path: "/vm",
			method: "POST",
			body,
		}).then((res) => new HyperbeamSession(this, res));
	}

	async deleteSession(sessionId: string): Promise<void> {
		return HbFetch<void>({
			baseUrl: this.baseUrl,
			authorization: this.apiKey,
			path: `/vm/${sessionId}`,
			method: "DELETE",
		});
	}

	async getSession(sessionId: string): Promise<HyperbeamSession> {
		return HbFetch<VMResponse>({
			baseUrl: this.baseUrl,
			authorization: this.apiKey,
			path: `/vm/${sessionId}`,
			method: "GET",
		}).then((res) => new HyperbeamSession(this, res));
	}
}

export class HyperbeamSession {
	sessionId: string;
	embedUrl: string;
	adminToken: string;
	api: HyperbeamAPI;

	constructor(api: HyperbeamAPI, props: VMResponse) {
		this.api = api;
		this.sessionId = props.session_id;
		this.embedUrl = props.embed_url;
		this.adminToken = props.admin_token;
	}

	get baseUrl(): string {
		const parsedEmbedUrl = new URL(this.embedUrl);
		return parsedEmbedUrl.origin + parsedEmbedUrl.pathname;
	}

	async setPermissions(userId: string, permissions: Partial<PermissionData>): Promise<void> {
		return HbFetch<void, [string, Partial<PermissionData>]>({
			baseUrl: this.baseUrl,
			authorization: this.adminToken,
			path: `/setPermissions`,
			method: "POST",
			body: [userId, permissions],
		});
	}

	async kickUser(userId: string): Promise<void> {
		return HbFetch<void, undefined>({
			baseUrl: this.baseUrl,
			authorization: this.adminToken,
			path: `/users/${userId}`,
			method: "DELETE",
			body: undefined,
		});
	}

	async delete(): Promise<void> {
		return this.api.deleteSession(this.sessionId);
	}
}

export default new HyperbeamAPI();
