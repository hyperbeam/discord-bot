import "./index.css";

import App from "./App.svelte";

// @ts-expect-error
const app = new App({
	target: document.body,
});

export default app;
