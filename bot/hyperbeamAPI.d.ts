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