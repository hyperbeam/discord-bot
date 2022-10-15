<script lang="ts">
	import { Room } from "colyseus.js";
	import { nanoid } from "nanoid";
	import { onMount } from "svelte";
	import { getNotificationsContext } from "svelte-notifications";
	import Cursor from "../components/Cursor.svelte";
	import Hyperbeam from "../components/Hyperbeam.svelte";
	import Toolbar from "../components/Toolbar.svelte";
	import RoomState from "../schemas/room";
	import { client } from "../scripts/api";
	import { currentUser, cursorInterval, members, room, trackedCursor } from "../store";

	const { addNotification } = getNotificationsContext();

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

	const attemptReconnect = async () => {
		if ($room) {
			await $room.leave(true);
			$room = undefined;
		}
		console.log("Attempting reconnect");
		window.clearInterval($cursorInterval);
		$cursorInterval = undefined;
		let isConnected = false;
		let i = 1;
		while (!isConnected) {
			const sec = Math.min(i, 15);
			try {
				await attemptJoin();
				isConnected = true;
				break;
			} catch (err) {
				console.log(`Disconnected, reconnecting in ${sec} seconds...`);
			}
			await new Promise((resolve) => setTimeout(resolve, sec * 1000));
			i++;
		}
	};

	const attemptJoin = async () => {
		if ($room) {
			await $room.leave(true);
			$room = undefined;
		}
		client.joinById(roomUrl, { token: getToken(), deviceId: getDeviceId() }).then((roomData: Room<RoomState>) => {
			$room = roomData;
			$members = [...$room.state.members.values()];
			$room.onStateChange((state) => {
				$members = [...state.members.values()];
				if ($currentUser) $members = $members.sort((a) => (a.id === $currentUser.id ? -1 : 1));
			});
			$room.onMessage("identify", (data: { id: string }) => {
				$currentUser = $members.find((m) => m.id === data.id);
			});
			$room.onLeave((code) => {
				if (code >= 1001 && code <= 1015) attemptReconnect();
			});
			$room.onError((code, message) => {
				console.log("Error", code, message);
				attemptReconnect();
			});

			const transport = $room.connection.transport as typeof $room.connection.transport & {
				ws: WebSocket;
			};
			$cursorInterval = window.setInterval(() => {
				try {
					if (transport.ws.readyState !== WebSocket.OPEN) {
						console.log("Not connected, skipping cursor update");
						throw new Error("WebSocket connection not open.");
					}
					$room.send("setCursor", $trackedCursor);
				} catch (err) {
					console.error(err);
					attemptReconnect();
				}
			}, 40);
		});
	};

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
	let showNativeCursor = false;

	function onNativeCursorMove(e: MouseEvent) {
		if (vmNode) {
			const rect = vmNode.getBoundingClientRect();
			showNativeCursor =
				e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
		}
	}

	/** Check if authentification was successful after clicking sign in button */
	function wasAuthSuccessful() {
		return !(localStorage.getItem("redirectAfterAuth") === `/${roomUrl}`);
	}

	$: if (!wasAuthSuccessful()) {
		addNotification({
			text: "Failed to sign in to Discord. Please try again.",
			type: "error",
			position: "top-right",
		});
		localStorage.removeItem("redirectAfterAuth");
	}

	$: isFullscreen = false;

	window.addEventListener("fullscreenchange", () => {
		isFullscreen = document.fullscreenElement !== null;
	});
</script>

{#if $room && $room.state.embedUrl}
	<div class="room" on:mousemove={onNativeCursorMove} style:--isFullscreen={isFullscreen ? 1 : 0}>
		<Hyperbeam embedUrl={$room.state.embedUrl} bind:vmNode {attemptReconnect} />
		{#if vmNode}
			{#each $members as member}
				{#if $currentUser && member.id === $currentUser.id}
					<Cursor
						displayed={!showNativeCursor}
						left={$trackedCursor.x}
						top={$trackedCursor.y}
						{vmNode}
						text={member.name}
						color={member.color} />
				{:else if member.cursor}
					<Cursor left={member.cursor.x} top={member.cursor.y} {vmNode} text={member.name} color={member.color} />
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
		margin-bottom: calc((1 - var(--isFullscreen)) * 56px);
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
