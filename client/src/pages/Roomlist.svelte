<script lang="ts">
  import { onMount } from "svelte";
  import { useNavigate } from "svelte-navigator";
  import Header from "../components/Header.svelte";

  import { apiRequest } from "../scripts/api";
  import { currentUser,rooms } from "../scripts/state";
  import { Room } from "../scripts/types";

  const navigate = useNavigate();

  interface RoomResponse {
    rooms: Room[];
  }
  onMount(() => {
  	apiRequest<RoomResponse>("/rooms").then((data) => {
  		$rooms = data.rooms;
  	});
  });

  $: ownedRooms = $rooms.filter((r) => r.ownerId === $currentUser.id);
  $: joinedRooms = $rooms.filter((r) => r.ownerId !== $currentUser.id);
</script>

<div>
  <Header />
  <div class="room-list">
    {#if ownedRooms.length}
      <h4>Owned Rooms</h4>
      <ul>
        {#each ownedRooms as room}
          <li on:click={() => navigate(`/${room.url}`)}>
            <span class="link">{room.name}</span>
          </li>
        {/each}
      </ul>
    {/if}
    {#if joinedRooms.length}
      <h4>Joined Rooms</h4>
      <ul>
        {#each joinedRooms as room}
          <li on:click={() => navigate(`/${room.url}`)}>
            <span class="link">{room.name}</span>
          </li>
        {/each}
      </ul>
    {/if}
    {#if !$rooms.length && !$currentUser}
      <p>You must be logged in to view rooms.</p>
    {:else if !$rooms.length && $currentUser}
      <p>No rooms created.</p>
    {/if}
  </div>
</div>

<style lang="scss">
  .room-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
  }

  .link {
    text-decoration: none;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
</style>
