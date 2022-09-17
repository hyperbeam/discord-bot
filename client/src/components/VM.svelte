<script lang="ts">
	import Hyperbeam from "@hyperbeam/web";
	import { onMount } from "svelte";
	import { hyperbeamEmbed } from "../store";

	export let embedUrl: string;
	let iframe: HTMLIFrameElement;

	onMount(async () => {
		$hyperbeamEmbed = await Hyperbeam(iframe, embedUrl);
	});
</script>

<div id="VM">
	<iframe id="hyperbeam" title="Hyperbeam" bind:this={iframe} />
</div>

<style>
	#hyperbeam {
		width: 100%;
		height: 100%;
		aspect-ratio: 16 / 9; /* TODO: check support */
	}
</style>
