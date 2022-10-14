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
		const element = document.getElementById("vm");
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

	const inviteUrl = [
		`https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}`,
		"permissions=277062470720",
		`redirect_uri=${encodeURIComponent(import.meta.env.VITE_CLIENT_BASE_URL + "/authorize")}`,
		"response_type=code",
		"scope=identify%20email%20bot%20applications.commands",
	].join("&");
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
			<Tooltip text="Add on Discord">
				<div
					class="icon"
					on:click={() => {
						window.location.href = inviteUrl;
					}}>
					<svg style="width:24px;height24px" viewBox="0 0 24 24">
						<path
							d="M18.9308 5.26368C17.6561 4.67878 16.2892 4.24785 14.8599 4.00104C14.8339 3.99627 14.8079 4.00818 14.7945 4.03198C14.6187 4.34466 14.4239 4.75258 14.2876 5.0732C12.7503 4.84306 11.221 4.84306 9.71527 5.0732C9.57887 4.74545 9.37707 4.34466 9.20048 4.03198C9.18707 4.00897 9.16107 3.99707 9.13504 4.00104C7.70659 4.24706 6.33963 4.67799 5.06411 5.26368C5.05307 5.26844 5.04361 5.27638 5.03732 5.28669C2.44449 9.16033 1.73421 12.9387 2.08265 16.6703C2.08423 16.6886 2.09447 16.706 2.10867 16.7171C3.81934 17.9734 5.47642 18.7361 7.10273 19.2416C7.12876 19.2496 7.15634 19.24 7.1729 19.2186C7.55761 18.6933 7.90054 18.1393 8.19456 17.5568C8.21192 17.5227 8.19535 17.4822 8.15989 17.4687C7.61594 17.2624 7.098 17.0108 6.59977 16.7251C6.56037 16.7021 6.55721 16.6457 6.59347 16.6187C6.69831 16.5402 6.80318 16.4584 6.9033 16.3759C6.92141 16.3608 6.94665 16.3576 6.96794 16.3671C10.2411 17.8615 13.7846 17.8615 17.0191 16.3671C17.0404 16.3568 17.0657 16.36 17.0846 16.3751C17.1847 16.4576 17.2895 16.5402 17.3952 16.6187C17.4314 16.6457 17.4291 16.7021 17.3897 16.7251C16.8914 17.0163 16.3735 17.2624 15.8288 17.4679C15.7933 17.4814 15.7775 17.5227 15.7949 17.5568C16.0952 18.1385 16.4381 18.6924 16.8157 19.2178C16.8315 19.24 16.8599 19.2496 16.8859 19.2416C18.5201 18.7361 20.1772 17.9734 21.8879 16.7171C21.9028 16.706 21.9123 16.6894 21.9139 16.6711C22.3309 12.357 21.2154 8.60956 18.9568 5.28748C18.9513 5.27638 18.9419 5.26844 18.9308 5.26368ZM8.68335 14.3982C7.69792 14.3982 6.88594 13.4935 6.88594 12.3824C6.88594 11.2713 7.68217 10.3666 8.68335 10.3666C9.69239 10.3666 10.4965 11.2793 10.4807 12.3824C10.4807 13.4935 9.68451 14.3982 8.68335 14.3982ZM15.329 14.3982C14.3435 14.3982 13.5316 13.4935 13.5316 12.3824C13.5316 11.2713 14.3278 10.3666 15.329 10.3666C16.338 10.3666 17.1421 11.2793 17.1264 12.3824C17.1264 13.4935 16.338 14.3982 15.329 14.3982Z"
							fill="currentColor" />
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
