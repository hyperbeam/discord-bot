<script lang="ts">
  import { Manager } from "socket.io-client";

  import { onMount } from "svelte";
  import { Route, Router } from "svelte-navigator";

  import Authorize from "./pages/Authorize.svelte";
  import Lander from "./pages/Lander.svelte";
  import Room from "./pages/Room.svelte";
  import Roomlist from "./pages/Roomlist.svelte";
  import { login } from "./scripts/api";
  import { manager } from "./scripts/state";

  const socketManager = new Manager(import.meta.env.VITE_API_SERVER_BASE_URL, {
    withCredentials: true,
    autoConnect: true,
    path: import.meta.env.VITE_CLIENT_SOCKET_URL,
  });

  const defaultSocket = socketManager.socket("/");

  onMount(async () => {
    console.log("Mounted app component");
    if (localStorage.getItem("token")) {
      try {
        await login().then(() => {
          console.log("Logged in");
          $manager = socketManager;
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
    <Route path="/rooms" component={Roomlist} />
    <Route path="/authorize" component={Authorize} />
    <Route path="/:roomUrl" component={Room} />
  </Router>
</div>
