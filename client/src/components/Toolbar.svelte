<script>
	import { navigate } from "svelte-navigator";
	import { currentUser, room } from "../store";
	import Members from "./Members.svelte";
	import Tooltip from "./Tooltip.svelte";
	import Volume from "./Volume.svelte";

	$: isFullscreen = false;

	window.addEventListener("fullscreenchange", () => {
		isFullscreen = document.fullscreenElement !== null;
	});

	function requestFullscreen() {
		const element = document.getElementById("VM");
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}

	const handleSignIn = async () => {
		localStorage.setItem("redirectAfterAuth", window.location.pathname);
		if ($room) await $room.leave(true);
		navigate("/authorize");
	};

	const handleSignOut = async () => {
		localStorage.removeItem("token");
		if ($room) await $room.leave(true);
		location.reload();
	};
</script>

{#if !isFullscreen}
	<div class="toolbar">
		<div class="toolbar__left">
			<Volume />
		</div>
		<Members />
		<div class="toolbar__right">
			<Tooltip text="Fullscreen">
				<div class="icon" on:click={requestFullscreen}>
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
					</svg>
				</div>
			</Tooltip>
			{#if $currentUser && $currentUser.isAuthenticated}
				<Tooltip text="Sign out">
					<div class="icon" on:click={handleSignOut}>
						<svg style="width:24px;height:24px" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
						</svg>
					</div>
				</Tooltip>
			{:else}
				<Tooltip text="Sign in">
					<div class="icon" on:click={handleSignIn}>
						<svg style="width:24px;height:24px" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
						</svg>
					</div>
				</Tooltip>
			{/if}
		</div>
	</div>
{/if}

<style>
	.toolbar {
		display: flex;
		align-items: center;
		padding: 4px;
	}

	.icon {
		margin: 4px;
		width: 40px;
		height: 40px;
		padding: 8px;
		cursor: pointer;
		border-radius: 8px;
	}

	.icon:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.icon:active {
		background-color: rgba(255, 255, 255, 0.2);
	}

	:global(.members) {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.toolbar__left {
		flex: 1;
		display: flex;
		justify-content: flex-start;
	}

	.toolbar__right {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}

	@media screen and (max-width: 767px) {
		.toolbar {
			display: grid;
			grid-template-areas:
				"members members"
				"left right";
		}

		.toolbar__left {
			grid-area: left;
		}

		.toolbar__right {
			grid-area: right;
		}

		:global(.members) {
			grid-area: members;
			position: static;
			transform: none;
			flex-wrap: wrap;
		}
	}
</style>
