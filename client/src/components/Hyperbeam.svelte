<script lang="ts">
	import Hyperbeam from "@hyperbeam/web";
	import { onMount } from "svelte";
	import { extendedError, hyperbeamEmbed, members, room, trackedCursor, type ExtendedErrorType } from "../store";

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
		try {
			$hyperbeamEmbed = await Hyperbeam(vmNode, embedUrl, {
				onDisconnect: async (e) => {
					const err: ExtendedErrorType = {
						title: "This session has ended",
						description: "Want to browse together?\nUse /start to start a new session.",
					};
					if ($room && $members) {
						const owner = $members.find((member) => $room.state.ownerId === member.id);
						if (owner) {
							err.description = [
								"Late to the party?",
								`Ask ${owner.name} for a new link or start a new session yourself.`,
							].join("\n");
						}
					}
					if (e.type === "inactive") err.title = "This session has been inactive for too long";
					else if (e.type === "kicked") {
						err.title = "You have been kicked from this session";
						err.description = "Want to browse together?\nUse /start to start a new session.";
					} else if (e.type === "absolute") err.title = "This session hit the time limit";
					$extendedError = err;
					if ($room) {
						await $room.leave(false).then(() => {
							$room = undefined;
							$members = undefined;
						});
					}
				},
			});
		} catch (e) {
			$extendedError = {
				title: "Failed to load session",
				description: "Please try again later.",
			};
			if ($room) {
				await $room.leave(false).then(() => {
					$room = undefined;
					$members = undefined;
				});
			}
		}
		maintainAspectRatio();
		$room.send("connectHbUser", { hbId: $hyperbeamEmbed.userId });
	});

	function onMousemove(event: MouseEvent) {
		const vmNodeRect = vmNode.getBoundingClientRect();
		$trackedCursor.x = (event.clientX - vmNodeRect.left) / vmWidth;
		$trackedCursor.y = (event.clientY - vmNodeRect.top) / vmHeight;
	}

	window.addEventListener("fullscreenchange", maintainAspectRatio);
</script>

<svelte:window on:resize={maintainAspectRatio} />
<div class="hyperbeam" style:--vmWidth={vmWidth} style:--vmHeight={vmHeight} bind:this={node}>
	<div id="vm" class="hyperbeam__vm" bind:this={vmNode} on:mousemove={onMousemove} />
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
