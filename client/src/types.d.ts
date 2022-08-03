/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
	interface ImportMetaEnv {
		readonly VITE_CLIENT_ID: string;
		readonly VITE_CLIENT_PORT: string;
		readonly VITE_CLIENT_BASE_URL: string;
		readonly VITE_CLIENT_SOCKET_URL: string;
		readonly VITE_API_SERVER_PORT: string;
		readonly VITE_API_SERVER_BASE_URL: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export { };