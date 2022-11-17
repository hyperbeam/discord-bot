<script lang="ts">
	export let src: string;
	export let alt: string;
	export let borderStyle: "none" | "dashed" | "solid" = "none";
</script>

<div class={`avatar ${borderStyle}`} on:click on:keypress>
	<img {src} {alt} />
</div>

<style lang="scss">
	@use "../assets/scss/variables";

	.avatar {
		margin: 4px;
		border-radius: 50%;
		padding: 4px;
		aspect-ratio: 1 / 1;
		width: 40px;
	}

	.dashed,
	.solid {
		padding: 2px;
	}

	.dashed {
		animation: pulse 1s 1;
		border: 2px dashed variables.$color-primary;
	}

	.solid {
		border: 2px solid variables.$color-primary;
	}

	.avatar img {
		border-radius: 50%;
		width: 100%;
		height: 100%;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
		}

		70% {
			box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
		}

		100% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
		}
	}
</style>
