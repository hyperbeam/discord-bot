<script lang="ts">
	import { onMount } from "svelte";
	import Loading from "../components/Loading.svelte";
	export let navigate;
	import { parseDiscordResponse, redirectToDiscord } from "../scripts/api";
	import { attemptSignIn } from "../store";

	function redirectBack() {
		$attemptSignIn = false;
		const redirectAfterAuth = localStorage.getItem("redirectAfterAuth");
		if (redirectAfterAuth) {
			localStorage.removeItem("redirectAfterAuth");
			navigate(redirectAfterAuth);
		} else {
			navigate("/");
		}
	}

	onMount(async () => {
		console.log("Mounted auth component");
		const token = localStorage.getItem("token");
		if (token && token !== "undefined") {
			// we already have a token, so we can skip the auth flow
			redirectBack();
		}
		if (!token || token === "undefined") {
			const urlParams = new URLSearchParams(window.location.href.substring(window.location.href.indexOf("?")));
			if (urlParams.has("code") && urlParams.has("state")) {
				// discord redirected back to this page with a code and state
				try {
					await parseDiscordResponse(urlParams.get("code"), urlParams.get("state"));
					redirectBack();
				} catch (e) {
					console.error(e);
				}
			} else if (urlParams.has("error")) {
				// discord redirected back to this page with an error
				console.error(urlParams.get("error"));
				redirectBack();
			} else if ($attemptSignIn) {
				$attemptSignIn = false;
				redirectToDiscord();
			} else redirectBack();
		}
	});
</script>

<Loading />
