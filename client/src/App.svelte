<script lang="ts">
  import { Router, Route } from "svelte-navigator";

  import Header from "./components/Header.svelte";
  import Roomlist from "./pages/Roomlist.svelte";
  import Authorize from "./pages/Authorize.svelte";
  import Room from "./pages/Room.svelte";
  import Lander from "./pages/Lander.svelte";
  import { login } from "./scripts/api";
  import { onMount } from "svelte";

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
