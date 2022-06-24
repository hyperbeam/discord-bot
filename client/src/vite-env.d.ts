/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_OAUTH_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}