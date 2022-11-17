import { defineConfig } from "vite";
import dotenv from "dotenv";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import viteCompression from "vite-plugin-compression";

dotenv.config({ path: "./.env" });
const port = parseInt(process.env.VITE_CLIENT_PORT || "4000", 10);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			preprocess: sveltePreprocess({
				typescript: true,
			}),
		}),
		viteCompression(),
	],
	root: "./client/",
	server: {
		port,
	},
	preview: {
		port,
	},
	publicDir: "./public",
	build: {
		outDir: "../dist/client",
		emptyOutDir: true,
	},
});
