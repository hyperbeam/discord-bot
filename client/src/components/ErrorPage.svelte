<script lang="ts">
	import { extendedError, ExtendedErrorType } from "../store";
	let errorDetails: ExtendedErrorType;
	$: errorDetails = {
		title: "We ran into an error",
		description: "Please try again later.",
		...$extendedError,
	};
</script>

<div class="container">
	<div class="errorInfo">
		<h2 class="title">{errorDetails.title}</h2>
		<p class="description">{errorDetails.description}</p>
	</div>
	<div class="suggestion">
		<p>Need help?</p>
		<div class="actions">
			<button
				class="support-btn"
				on:click={() => {
					window.location.href = import.meta.env.VITE_DISCORD_SUPPORT_SERVER;
				}}>
				Join our Discord
			</button>
			<button
				class="support-btn"
				on:click={() => {
					window.location.href = import.meta.env.VITE_GITHUB_URL;
				}}>
				Report an issue
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		justify-content: flex-start;
		align-items: flex-start;
		height: 100%;
	}

	.errorInfo {
		.description {
			white-space: pre-line;
		}
	}
</style>
