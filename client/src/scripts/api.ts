import { Client } from "colyseus.js";
import { nanoid } from "nanoid";

const useSSL = import.meta.env.VITE_API_SERVER_BASE_URL.startsWith("https");
const hostname = `${import.meta.env.VITE_API_SERVER_BASE_URL.split("://")[1]}`;
export const client = new Client({ hostname, useSSL, port: useSSL ? 443 : 80 });

// adds headers and token for convenience
export async function apiRequest<T>(route: string, method = "GET", body?: any): Promise<T> {
	const token = localStorage.getItem("token");
	let shouldSpecifyToken = true;
	if (!token || token === "undefined") {
		localStorage.removeItem("token");
		shouldSpecifyToken = false;
	}
	const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}${route}`, {
		method,
		credentials: "include",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
			...(shouldSpecifyToken ? { Authorization: `Bearer ${token}` } : {}),
		},
	});
	const data = await response.json();
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
	return data as T;
}

interface AuthorizedUser {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string;
	token: string;
}

export async function parseDiscordResponse(code: string, state: string): Promise<AuthorizedUser> {
	if (state !== localStorage.getItem("state")) throw new Error("Invalid OAuth2 state");
	localStorage.removeItem("state");
	const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}/authorize/${code}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
	const data: AuthorizedUser = (await response.json()) as AuthorizedUser;
	if (!data.id || !data.token) throw new Error("Unable to determine user");
	localStorage.setItem("token", data.token);
	return data;
}

export const oauthUrl = (state: string) =>
	`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID!}&redirect_uri=${encodeURIComponent(
		import.meta.env.VITE_CLIENT_BASE_URL!,
	)}%2Fauthorize&response_type=code&scope=identify%20email&state=${state}`;

export function redirectToDiscord(redirectAfterAuth?: string) {
	const redirectRoute = redirectAfterAuth || localStorage.getItem("redirectAfterAuth");
	if (redirectRoute) localStorage.setItem("redirectAfterAuth", redirectRoute);
	const state = nanoid();
	localStorage.setItem("state", state);
	window.location.href = oauthUrl(state);
}
