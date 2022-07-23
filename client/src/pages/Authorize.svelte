<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-navigator";
  import {
    parseDiscordResponse,
    redirectToDiscord,
    login,
  } from "../scripts/api";
  onMount(async () => {
    console.log("Mounted auth component");
    const token = localStorage.getItem("token");
    console.log({ token });
    if (token && token !== "undefined") {
      // we already have a token, so we can skip the discord flow
      try {
        await login();
        navigate("/");
      } catch (e) {
        // token doesn't work, get rid of it
        console.error(e);
        localStorage.removeItem("token");
      }
    }
    if (!token || token === "undefined") {
      const urlParams = new URLSearchParams(
        window.location.href.substring(window.location.href.indexOf("?"))
      );
      if (urlParams.has("code") && urlParams.has("state")) {
        // discord redirected back to this page with a code and state
        try {
          parseDiscordResponse(urlParams.get("code"), urlParams.get("state"));
          navigate("/");
        } catch (e) {
          console.error(e);
        }
      } else {
        // we don't have a token, code or state, so we need to redirect to discord
        redirectToDiscord();
      }
    }
  });
</script>

<div class="loading">Loading...</div>

<style>
</style>
