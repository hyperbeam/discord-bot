<script lang="ts">
	import Hyperbeam from "@hyperbeam/web";
	import { onMount } from "svelte";
	import { hyperbeamEmbed } from "../store";

	export let embedUrl: string;
	export const iframeAspect = 16 / 9;
	let node: HTMLElement;
	export let vmNode: HTMLDivElement;
	let vmWidth: number = 0;
	let vmHeight: number = 0;

	function maintainAspectRatio() {
		const nodeRect = node.getBoundingClientRect();
		const nodeAspect = nodeRect.width / nodeRect.height;
		if (iframeAspect > nodeAspect) {
			vmWidth = nodeRect.width;
			vmHeight = nodeRect.width / iframeAspect;
		} else {
			vmWidth = nodeRect.height * iframeAspect;
			vmHeight = nodeRect.height;
		}
	}

	onMount(async () => {
		$hyperbeamEmbed = await Hyperbeam(vmNode, embedUrl);
		maintainAspectRatio();
	});
</script>

<svelte:window on:resize={maintainAspectRatio} />
<div class="hyperbeam" style:--vmWidth={vmWidth} style:--vmHeight={vmHeight} bind:this={node}>
	<div class="hyperbeam__vm" title="Hyperbeam" bind:this={vmNode} />
</div>

<style>
	.hyperbeam__vm {
		width: calc(var(--vmWidth) * 1px);
		height: calc(var(--vmHeight) * 1px);
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
</style>
