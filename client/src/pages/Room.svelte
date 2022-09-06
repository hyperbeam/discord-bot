<script lang="ts">
  import { onMount } from "svelte";

  import Toolbar from "../components/Toolbar.svelte";
  import VM from "../components/VM.svelte";
  import { apiRequest } from "../scripts/api";
  import { currentRoom, rooms } from "../scripts/state";
  import { Room, Session } from "../scripts/types";
  import { hb } from "../scripts/state";
  export let roomUrl: string;

  let embedUrl: string;

  onMount(async () => {
    if (roomUrl) {
      let room: Room & { session: Session };
      try {
        room = await apiRequest(`/room/${roomUrl}`);
      } catch (e) {
        console.error(e);
      }
      if (room) {
        $currentRoom = room;
        console.log({ currentRoom: $currentRoom });
        embedUrl = room.session.embedUrl;
      }
    }
    if ($rooms.some((room) => room.url)) {
      $currentRoom = $rooms.find((room) => room.url === roomUrl);
    } else if (!$currentRoom) {
      const newRoom = await apiRequest<Room>(roomUrl, "GET").catch((err) => {
        console.error(err);
      });
      if (!newRoom) return;
      $currentRoom = newRoom;
      $rooms = [...$rooms, newRoom];
    }
  });
</script>

<div class="room">
  {#if embedUrl}
    <VM {embedUrl} />
    {#if $hb}
      <Toolbar />
    {/if}
  {/if}
</div>

<style lang="scss">
  .room {
    height: 100%;
  }

  :global(#VM) {
    position: absolute;
    inset: 0;
    margin: 0 0 48px 0; /* Toolbar height */
  }
  
  /* TODO: align toolbar to bottom of VM */
  :global(.toolbar) {
    position: fixed;
    bottom: 0;
    width: 100%;
  }
</style>
