<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	export let color: string = "#000000";
	export let displayed: boolean = true;
	export let interpolate = true;

	/** Reference to the Hyperbeam iframe */
	export let vmNode: HTMLDivElement;
	/** X coordinate of the cursor relative to the vm as a value from 0 to 1 */
	export let left = 0;
	/** Y coordinate of the cursor relative to the vm as a value from 0 to 1 */
	export let top = 0;
	/** Text to display in the cursor */
	export let text = "";

	$: computedColor = typeof color === "string" && color.length && color.startsWith("#") ? color : "#000000";

	let hidden: boolean = false;
	let cursorTimeout: number = undefined;

	$: if (left !== undefined && top !== undefined) {
		hidden = false;
		window.clearTimeout(cursorTimeout);
		cursorTimeout = window.setTimeout(() => {
			hidden = true;
		}, 5 * 1000);
	}

	let vmNodeRect = vmNode.getBoundingClientRect();
	const resizeObserver = new ResizeObserver(() => {
		vmNodeRect = vmNode.getBoundingClientRect();
	});
	onMount(() => {
		resizeObserver.observe(vmNode);
	});
	onDestroy(() => {
		resizeObserver.disconnect();
	});

	import { spring } from "svelte/motion";
	import { writable } from "svelte/store";
	const coords = interpolate
		? spring({ x: vmNodeRect.left + left * vmNodeRect.width, y: vmNodeRect.top + top * vmNodeRect.height })
		: writable({ x: vmNodeRect.left + left * vmNodeRect.width, y: vmNodeRect.top + top * vmNodeRect.height });
	$: $coords = { x: vmNodeRect.left + left * vmNodeRect.width, y: vmNodeRect.top + top * vmNodeRect.height };
</script>

<div
	class="cursor"
	style:display={displayed ? "block" : "none"}
	style:--coords-x={$coords.x}
	style:--coords-y={$coords.y}
	style:--cursorOpacity={hidden ? 0 : 1}>
	<svg class="cursor__icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M14.3331 24.4662C14.4454 24.758 14.8616 24.7486 14.9605 24.4519L17.3333 17.3333L24.4519 14.9605C24.7486 14.8616 24.758 14.4454 24.4662 14.3331L8.70001 8.26923C8.43043 8.16555 8.16555 8.43043 8.26923 8.70001L14.3331 24.4662Z"
			fill={computedColor} />
		<path
			d="M14.3331 24.4662C14.4454 24.758 14.8616 24.7486 14.9605 24.4519L17.3333 17.3333L24.4519 14.9605C24.7486 14.8616 24.758 14.4454 24.4662 14.3331L8.70001 8.26923C8.43043 8.16555 8.16555 8.43043 8.26923 8.70001L14.3331 24.4662Z"
			stroke="white"
			stroke-linejoin="round" />
	</svg>

	<div class="cursor__text" style:--cursorColor={computedColor}>{text}</div>
</div>

<style lang="scss">
	.cursor {
		opacity: var(--cursorOpacity, 1);
		transition: opacity 150ms ease-in-out;
		position: absolute;
		left: 0;
		top: 0;
		width: 32px;
		height: 32px;
		pointer-events: none;

		transform: translate(calc(var(--coords-x) * 1px), calc(var(--coords-y) * 1px));

		&__icon {
			width: 32px;
			height: 32px;
			translate: -8px -8px;
		}

		&__text {
			position: absolute;
			left: 24px;
			top: 24px;
			translate: -8px -8px;
			color: white;
			background-color: var(--cursorColor);
			font-size: 12px;
			white-space: nowrap;
			position: absolute;
			padding: 2px 6px;
			border-radius: 4px;
			pointer-events: none;
			border: 1px solid #fffb;
			&::selection {
				background: transparent;
			}
		}
	}
</style>
