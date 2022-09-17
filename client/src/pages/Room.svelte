<script lang="ts">
	import { Client, Room } from "colyseus.js";
	import { onMount } from "svelte";
	import Toolbar from "../components/Toolbar.svelte";
	import Vm from "../components/VM.svelte";
	import RoomState from "../schemas/room";
	import { hb } from "../scripts/state";

	export let roomUrl: string;
	let client: Client;
	let room: Room<RoomState>;
	let roomState: RoomState;

	onMount(async () => {
		client = new Client(`ws://${import.meta.env.VITE_API_SERVER_BASE_URL.split("://")[1]}`);
		room = await client.joinById(roomUrl);
		room.onStateChange((state) => {
			roomState = state;
		});
	});
</script>

{#if roomState}
	<div class="room">
		<Vm embedUrl={roomState.embedUrl} />
		<Toolbar />
	</div>
{/if}

<style lang="scss">
	.room {
		height: 100%;
	}

	:global(#VM) {
		position: absolute;
		inset: 0;
		margin: 0 0 56px 0; /* Toolbar height */
	}

	/* TODO: align toolbar to bottom of VM */
	:global(.toolbar) {
		position: fixed;
		bottom: 0;
		width: 100%;
	}

	@media (max-width: 767px) {
		:global(#VM) {
			position: absolute;
			inset: 0;
			margin: 0 0 112px 0; /* Toolbar height */
		}
	}
</style>
