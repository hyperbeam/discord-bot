<script lang="ts">
	import { onMount } from "svelte";
	export let navigate;
	import { parseDiscordResponse, redirectToDiscord } from "../scripts/api";
	onMount(async () => {
		console.log("Mounted auth component");
		const token = localStorage.getItem("token");
		if (token && token !== "undefined") {
			// we already have a token, so we can skip the auth flow
			const redirectRoute = localStorage.getItem("redirectAfterAuth");
			localStorage.removeItem("redirectAfterAuth");
			if (redirectRoute && redirectRoute !== "undefined") {
				navigate(redirectRoute);
			} else {
				navigate("/");
			}
		}
		if (!token || token === "undefined") {
			const urlParams = new URLSearchParams(window.location.href.substring(window.location.href.indexOf("?")));
			if (urlParams.has("code") && urlParams.has("state")) {
				// discord redirected back to this page with a code and state
				try {
					await parseDiscordResponse(urlParams.get("code"), urlParams.get("state"));
					const redirectRoute = localStorage.getItem("redirectAfterAuth");
					localStorage.removeItem("redirectAfterAuth");
					if (redirectRoute && redirectRoute !== "undefined") {
						navigate(redirectRoute);
					} else {
						navigate("/");
					}
				} catch (e) {
					console.error(e);
				}
			} else {
				// we don't have a token, code or state, so we need to redirect to discord
				redirectToDiscord();
			}
		}
	});
</script>

<div class="loading">Loading...</div>

<style>
</style>
