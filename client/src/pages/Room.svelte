<script lang="ts">
	import { onMount } from "svelte";
	import { getNotificationsContext } from "svelte-notifications";
	import Cursor from "../components/Cursor.svelte";
	import ErrorPage from "../components/ErrorPage.svelte";
	import Hyperbeam from "../components/Hyperbeam.svelte";
	import Toolbar from "../components/Toolbar.svelte";
	import { connect } from "../scripts/api";
	import { currentUser, members, room, trackedCursor } from "../store";

	const { addNotification } = getNotificationsContext();

	export let roomUrl: string;

	onMount(async () => {
		try {
			await connect(roomUrl);
		} catch (e) {
			console.log("Failed to join room", e);
			localStorage.removeItem("token");
			await connect(roomUrl);
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
		<Hyperbeam embedUrl={$room.state.embedUrl} bind:vmNode />
		{#if vmNode}
			{#each $members as member}
				{#if $currentUser && member.id === $currentUser.id}
					<Cursor
						displayed={!showNativeCursor}
						left={$trackedCursor.x}
						top={$trackedCursor.y}
						{vmNode}
						text={member.name}
						color={member.color}
						interpolate={false} />
				{:else if member.cursor}
					<Cursor left={member.cursor.x} top={member.cursor.y} {vmNode} text={member.name} color={member.color} />
				{/if}
			{/each}
		{/if}
		<Toolbar />
	</div>
{:else}
	<ErrorPage />
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
