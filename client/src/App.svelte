<script lang="ts">
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-navigator";

	import Authorize from "./pages/Authorize.svelte";
	import Lander from "./pages/Lander.svelte";
	import Room from "./pages/Room.svelte";
	import { login } from "./scripts/api";

	onMount(async () => {
		console.log("Mounted app component");
		if (localStorage.getItem("token")) {
			try {
				await login().then(() => {
					console.log("Logged in");
				});
			} catch (e) {
				console.error(e);
				localStorage.removeItem("token");
			}
		}
	});
</script>

<div>
	<Router primary={false}>
		<!-- <Header /> -->
		<Route path="/" component={Lander} />
		<Route path="/authorize" component={Authorize} />
		<Route path="/:roomUrl" component={Room} />
	</Router>
</div>
