<script lang="ts">
  import { onMount } from "svelte";
  
  import Header from "../components/Header.svelte";
  import VM from "../components/VM.svelte";
  import { apiRequest } from "../scripts/api";
  import { currentRoom,rooms } from "../scripts/state";
  import { Room,Session } from "../scripts/types";

  export let roomUrl: string;

  let embedUrl: string;

  onMount(async () => {
  	if (roomUrl) {
  		const room = await apiRequest<Room & { session: Session }>(
  			`/room/${roomUrl}`,
  		);
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
  <VM {embedUrl} />
</div>
