<script lang="ts">
	import { Room } from "colyseus.js";
	import { nanoid } from "nanoid";
	import { onMount } from "svelte";
	import Cursor from "../components/Cursor.svelte";
	import Hyperbeam from "../components/Hyperbeam.svelte";
	import Toolbar from "../components/Toolbar.svelte";
	import RoomState from "../schemas/room";
	import { client } from "../scripts/api";
	import { members, room } from "../store";

	export let roomUrl: string;
	const getToken = () => {
		const token = localStorage.getItem("token");
		if (typeof token === "string" && token !== "undefined") {
			return token;
		}
		return null;
	};

	const getDeviceId = () => {
		const deviceId = localStorage.getItem("deviceId");
		if (typeof deviceId === "string" && deviceId !== "undefined") {
			return deviceId;
		} else {
			const newDeviceId = nanoid();
			localStorage.setItem("deviceId", newDeviceId);
			return newDeviceId;
		}
	};

	const attemptJoin = async () =>
		client.joinById(roomUrl, { token: getToken(), deviceId: getDeviceId() }).then((roomData: Room<RoomState>) => {
			$room = roomData;
			$members = [...$room.state.members.values()];
			$room.onStateChange((state) => {
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

	let vmNode: HTMLDivElement;
</script>

{#if $room && $room.state.embedUrl}
	<div class="room">
		<Hyperbeam embedUrl={$room.state.embedUrl} bind:vmNode />
		{#if vmNode}
			{#each $members as member}
				{#if member.cursor}
					<Cursor left={member.cursor.x} top={member.cursor.y} {vmNode} text={member.name} />
				{/if}
			{/each}
		{/if}
		<Toolbar />
	</div>
{/if}

<style lang="scss">
	.room {
		height: 100%;
	}

	:global(.hyperbeam) {
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
		:global(.hyperbeam) {
			position: absolute;
			inset: 0;
			margin: 0 0 112px 0; /* Toolbar height */
		}
	}
</style>
