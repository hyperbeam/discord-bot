<script lang="ts">
  import { Manager } from "socket.io-client";
  import { onMount } from "svelte";
  import { Route,Router } from "svelte-navigator";

  import Authorize from "./pages/Authorize.svelte";
  import Lander from "./pages/Lander.svelte";
  import Room from "./pages/Room.svelte";
  import Roomlist from "./pages/Roomlist.svelte";
  import { login } from "./scripts/api";

  const manager = new Manager(import.meta.env.VITE_API_SERVER_BASE_URL, {
  	withCredentials: true,
  	autoConnect: false,
  	path: import.meta.env.VITE_CLIENT_SOCKET_URL,
  });

  const socket = manager.socket("/");

  socket.on("connect", () => {
  	console.log("Connected");
  });

  socket.on("connect_error", (error) => {
  	console.error(error);
  });

  onMount(async () => {
  	console.log("Mounted app component");
  	if (localStorage.getItem("token")) {
  		try {
  			await login().then(() => {
  				console.log("Logged in");
  				socket.connect();
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
