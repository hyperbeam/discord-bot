<script lang="ts">
	import Hyperbeam from "@hyperbeam/web";
	import { onMount } from "svelte";
	import { hyperbeamEmbed } from "../store";

	export let embedUrl: string;
	export const iframeAspect = 16 / 9;
	let node: HTMLElement;
	export let iframeNode: HTMLIFrameElement;
	let iframeWidth: number = 0;
	let iframeHeight: number = 0;

	function maintainAspectRatio() {
		const nodeRect = node.getBoundingClientRect();
		const nodeAspect = nodeRect.width / nodeRect.height;
		if (iframeAspect > nodeAspect) {
			iframeWidth = nodeRect.width;
			iframeHeight = nodeRect.width / iframeAspect;
		} else {
			iframeWidth = nodeRect.height * iframeAspect;
			iframeHeight = nodeRect.height;
		}
	}

	onMount(async () => {
		$hyperbeamEmbed = await Hyperbeam(iframeNode, embedUrl);
		maintainAspectRatio();
	});
</script>

<svelte:window on:resize={maintainAspectRatio} />
<div class="hyperbeam" style:--iframeWidth={iframeWidth} style:--iframeHeight={iframeHeight} bind:this={node}>
	<iframe class="hyperbeam__iframe" title="Hyperbeam" bind:this={iframeNode} />
</div>

<style>
	.hyperbeam__iframe {
		width: calc(var(--iframeWidth) * 1px);
		height: calc(var(--iframeHeight) * 1px);
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
</style>
