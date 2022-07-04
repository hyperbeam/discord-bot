import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mkcert from "vite-plugin-mkcert";

const port = parseInt(process.env.VITE_CLIENT_PORT || "4000", 10);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		mkcert(),
		react(),
	],
	root: "./client/",
	server: {
		port,
	},
});
