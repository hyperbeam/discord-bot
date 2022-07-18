export interface UserData {
	userId: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string | null;
}

export interface UserProps {
	user: UserData | null;
	// eslint-disable-next-line no-unused-vars
	setUser: (user: UserData | null) => void;
}

export const getToken = () => localStorage.getItem("token");

export async function apiRequest<T>(route: string, method = "GET", body?: any): Promise<T> {
	const token = getToken();
	if (!token) throw new Error("No token found");
	const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}${route}`, {
		method,
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`,
		},
	});
	const data = await response.json();
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
	return data as T;
}


export async function verifyUser(): Promise<UserData | null> {
	return apiRequest<UserData | null>("/verify/");
}

export async function authorizeUser(code): Promise<UserData | null> {
	const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}/authorize/${code}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) console.error(`${response.status} ${response.statusText}`);
	const data = await response.json();
	if (!data) return null;
	if (data.token) localStorage.setItem("token", data.token);
	return data;
}

export function logoutUser() {
	localStorage.removeItem("token");
}

export function isLoggedIn() {
	return !!localStorage.getItem("token");
}

export const oauthUrl = (state: string) => `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID!}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_CLIENT_BASE_URL!)}%2Fauthorize&response_type=code&scope=identify%20email&state=${state}`;