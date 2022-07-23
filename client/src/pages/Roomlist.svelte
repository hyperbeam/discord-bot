<script lang="ts">
  import { currentUser, joinedRooms, ownedRooms } from "../scripts/state";
</script>

<div class="room-list">
  {#if $ownedRooms.length}
    <h4>Owned Rooms</h4>
    <ul>
      {#each $ownedRooms as room}
        <li>
          <a href={room.url}>{room.name}</a>
        </li>
      {/each}
    </ul>
  {/if}
  {#if $joinedRooms.length}
    <h4>Joined Rooms</h4>
    <ul>
      {#each $joinedRooms as room}
        <li>
          <a href={room.url}>{room.name}</a>
        </li>
      {/each}
    </ul>
  {/if}
  {#if !$ownedRooms.length && !$joinedRooms.length && !$currentUser}
    <p>You must be logged in to view rooms.</p>
  {:else if !$ownedRooms.length && !$joinedRooms.length && $currentUser}
    <p>No rooms created.</p>
  {/if}
</div>

<style>
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
</style>
