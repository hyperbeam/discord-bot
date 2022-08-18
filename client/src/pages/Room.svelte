<script lang="ts">
  import { onMount } from "svelte";

  import Header from "../components/Header.svelte";
  import VM from "../components/VM.svelte";
  import { apiRequest } from "../scripts/api";
  import { currentRoom, rooms } from "../scripts/state";
  import { Room, Session } from "../scripts/types";

  export let roomUrl: string;

  let embedUrl: string;

  onMount(async () => {
  	if (roomUrl) {
  		let room;
  		try {
  			room = await apiRequest<Room & { session: Session }>(
  				`/room/${roomUrl}`,
  			);
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
  <Header />
  {#if $currentRoom}
    <VM {embedUrl} />
  {:else}
    <div class="container">
      <p>Room not active.</p>
    </div>
  {/if}
</div>

<style lang="scss">
  .room {
    height: 100%;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-height: 100%;
    height: 100%;
    width: 100%;
  }
</style>
