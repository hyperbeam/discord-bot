<script lang="ts">
  import { useNavigate } from "svelte-navigator";
  
  import { logoutUser } from "../scripts/api";
  import { currentRoom, currentUser } from "../scripts/state";
  import Avatar from "./Avatar.svelte";
  export let title: string = "Hyperbeam bot";

  const navigate = useNavigate();
</script>

<div class="header">
  <div class="header-left">
    <h3 class="header-logo">
      {title}
    </h3>
  </div>
  <div class="header-right">
    <!-- TODO: Replace with share button after implementing modal -->
    {#if $currentRoom}
      <button
        on:click={() => {
          navigator.clipboard.writeText(window.location.href);
        }}>Copy invite link</button
      >
    {/if}
    {#if $currentUser}
      <Avatar
        src={`https://cdn.discordapp.com/avatars/${$currentUser.id}/${$currentUser.avatar}`}
        alt={$currentUser.username}
        borderStyle={undefined}
      />
      <button on:click={logoutUser} class="logout">Logout</button>
    {:else}
      <button on:click={() => navigate("/authorize")} class="login"
        >Login</button
      >
    {/if}
  </div>
</div>

<style>
  .header {
    display: flex;
    width: 100%;
    height: 64px;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
  }

  .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
