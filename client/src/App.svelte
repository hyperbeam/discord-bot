<script lang="ts">
	import { Route, Router } from "svelte-navigator";
	import Authorize from "./pages/Authorize.svelte";
	import Lander from "./pages/Lander.svelte";
	import Room from "./pages/Room.svelte";
	import Notifications from "svelte-notifications";
</script>

<div>
	<Notifications>
		<Router primary={false}>
			<Route path="/" component={Lander} />
			<Route path="/authorize" component={Authorize} />
			<Route path="/:roomUrl" component={Room} />
		</Router>
	</Notifications>
</div>
