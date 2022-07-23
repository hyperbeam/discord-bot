import { defineConfig } from "vite";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mkcert from "vite-plugin-mkcert";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

const port = parseInt(process.env.VITE_CLIENT_PORT || "4000", 10);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		mkcert(),
		svelte({
			preprocess: sveltePreprocess({
				typescript: true,
			}),
		}),
	],
	root: "./client/",
	server: {
		port,
	},
	preview: {
		port,
	},
	build: {
		outDir: "../dist/client",
		emptyOutDir: true,
	},
});
