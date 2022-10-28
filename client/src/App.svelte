<script lang="ts">
	import { Route, Router } from "svelte-navigator";
	import Authorize from "./pages/Authorize.svelte";
	import Lander from "./pages/Lander.svelte";
	import Room from "./pages/Room.svelte";
	import Notifications from "svelte-notifications";
</script>

<Notifications>
	<Router primary={false}>
		<Route path="/"><Lander /></Route>
		<Route path="/authorize" let:navigate><Authorize {navigate} /></Route>
		<Route path="/:roomUrl" let:params><Room roomUrl={params.roomUrl} /></Route>
	</Router>
</Notifications>
