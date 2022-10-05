<script lang="ts">
	import Hyperbeam from "@hyperbeam/web";
	import { onMount } from "svelte";
	import { hyperbeamEmbed, room, trackedCursor } from "../store";

	export let attemptReconnect: () => void;
	export let embedUrl: string;
	export const iframeAspect = 16 / 9;
	let node: HTMLElement;
	export let vmNode: HTMLDivElement;
	let vmWidth: number = 0;
	let vmHeight: number = 0;

	function maintainAspectRatio() {
		if (!node) return;
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
		if ($hyperbeamEmbed) $hyperbeamEmbed.destroy();
		$hyperbeamEmbed = await Hyperbeam(vmNode, embedUrl);
		maintainAspectRatio();
		$room.send("connectHbUser", { hbId: $hyperbeamEmbed.userId });
	});

	$room.onError((code, message) => {
		console.log("Error", code, message);
		attemptReconnect();
	});

	function onMousemove(event: MouseEvent) {
		const vmNodeRect = vmNode.getBoundingClientRect();
		$trackedCursor.x = (event.clientX - vmNodeRect.left) / vmWidth;
		$trackedCursor.y = (event.clientY - vmNodeRect.top) / vmHeight;
	}
</script>

<svelte:window on:resize={maintainAspectRatio} />
<div class="hyperbeam" style:--vmWidth={vmWidth} style:--vmHeight={vmHeight} bind:this={node}>
	<div class="hyperbeam__vm" bind:this={vmNode} on:mousemove={onMousemove} />
</div>

<style>
	.hyperbeam__vm {
		width: calc(var(--vmWidth) * 1px);
		height: calc(var(--vmHeight) * 1px);
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		cursor: none;
	}
</style>
