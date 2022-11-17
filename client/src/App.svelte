<script lang="ts">
	import "./assets/scss/main.scss";
	import { Route, Router } from "svelte-navigator";
	import Notifications from "svelte-notifications";
	import Authorize from "./pages/Authorize.svelte";
	import Lander from "./pages/Lander.svelte";
	import Room from "./pages/Room.svelte";
</script>

<Notifications>
	<Router primary={false}>
		<Route path="/"><Lander /></Route>
		<Route path="/authorize" let:navigate><Authorize {navigate} /></Route>
		<Route path="/:roomUrl" let:params><Room roomUrl={params.roomUrl} /></Route>
	</Router>
</Notifications>
