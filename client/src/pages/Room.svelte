<script lang="ts">
	import { Room } from "colyseus.js";
	import { onMount } from "svelte";
	import Toolbar from "../components/Toolbar.svelte";
	import Vm from "../components/VM.svelte";
	import RoomState from "../schemas/room";
	import { members, room } from "../store";
	import { client } from "../scripts/api";

	export let roomUrl: string;
	const getToken = () => {
		const token = localStorage.getItem("token");
		if (typeof token === "string" && token !== "undefined") {
			return token;
		}
		return null;
	};

	const attemptJoin = async () =>
		client.joinById(roomUrl, { token: getToken() }).then((roomData: Room<RoomState>) => {
			$room = roomData;
			$room.onStateChange((state) => {
				console.log("State changed", state);
				$members = [...state.members.values()];
			});
		});

	onMount(async () => {
		try {
			await attemptJoin();
		} catch (e) {
			console.log("Failed to join room", e);
			localStorage.removeItem("token");
			await attemptJoin();
		}
	});
</script>

{#if $room && $room.state.embedUrl}
	<div class="room">
		<Vm embedUrl={$room.state.embedUrl} />
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
