<script lang="ts">
	import { Route, Router } from "svelte-navigator";
	import Authorize from "./pages/Authorize.svelte";
	import Lander from "./pages/Lander.svelte";
	import Room from "./pages/Room.svelte";
</script>

<div>
	<Router primary={false}>
		<Route path="/" component={Lander} />
		<Route path="/authorize" component={Authorize} />
		<Route path="/:roomUrl" component={Room} />
	</Router>
</div>
