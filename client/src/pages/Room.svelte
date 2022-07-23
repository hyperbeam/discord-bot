<script lang="ts">
  import { onMount } from "svelte";

  import VM from "../components/VM.svelte";
  import { apiRequest } from "../scripts/api";
  import {
  	currentRoom,
  	currentUser,
  	joinedRooms,
  	ownedRooms,
  } from "../scripts/state";
  import { Room, Session } from "../scripts/types";

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
  	if ($ownedRooms.some((room) => room.url)) {
  		$currentRoom = $ownedRooms.find((room) => room.url === roomUrl);
  	} else if ($joinedRooms.some((room) => room.url)) {
  		$currentRoom = $joinedRooms.find((room) => room.url === roomUrl);
  	} else if (!$currentRoom) {
  		const newRoom = await apiRequest<Room>(roomUrl, "GET").catch((err) => {
  			console.error(err);
  		});
  		if (!newRoom) return;
  		$currentRoom = newRoom;
  		if ($currentUser && newRoom.ownerId === $currentUser.id) {
  			$ownedRooms = [...$ownedRooms, newRoom];
  		} else {
  			$joinedRooms = [...$joinedRooms, newRoom];
  		}
  	}
  });
</script>

<div class="room">
  <VM {embedUrl} />
</div>
