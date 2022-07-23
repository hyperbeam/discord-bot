<script lang="ts">
  import { onMount } from "svelte";
  import { Route,Router } from "svelte-navigator";
  
  import Header from "./components/Header.svelte";
  import Authorize from "./pages/Authorize.svelte";
  import Lander from "./pages/Lander.svelte";
  import Room from "./pages/Room.svelte";
  import Roomlist from "./pages/Roomlist.svelte";
  import { login } from "./scripts/api";

  onMount(() => {
  	console.log("Mounted app component");
  	if (localStorage.getItem("token")) {
  		try {
  			login();
  		} catch (e) {
  			console.error(e);
  			localStorage.removeItem("token");
  		}
  	}
  });
</script>

<div>
  <Router primary={false}>
    <Header />
    <Route path="/" component={Lander} />
    <Route path="/rooms" component={Roomlist} />
    <Route path="/authorize" component={Authorize} />
    <Route path="/:roomUrl" component={Room} />
  </Router>
</div>
