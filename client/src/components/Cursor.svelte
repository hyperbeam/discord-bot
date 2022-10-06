<script lang="ts">
	import { PerfectCursor } from "perfect-cursors";
	import { onMount } from "svelte";
	export let color: string = "#000000";

	/** Reference to the Hyperbeam iframe */
	export let vmNode: HTMLDivElement;
	/** X coordinate of the cursor relative to the vm as a value from 0 to 1 */
	export let left = 0;
	/** Y coordinate of the cursor relative to the vm as a value from 0 to 1 */
	export let top = 0;
	/** Text to display in the cursor */
	export let text = "";

	let adjustedLeft = 0;
	let adjustedTop = 0;

	let vmNodeRect = vmNode.getBoundingClientRect();

	function updateMyCursor(point: number[]) {
		adjustedLeft = vmNodeRect.left + point[0] * vmNodeRect.width;
		adjustedTop = vmNodeRect.top + point[1] * vmNodeRect.height;
	}

	$: computedColor = typeof color === "string" && color.length && color.startsWith("#") ? color : "#000000";

	const pc = new PerfectCursor(updateMyCursor);

	const resizeObserver = new ResizeObserver(() => {
		vmNodeRect = vmNode.getBoundingClientRect();
		pc.addPoint([left, top]);
	});

	onMount(async () => {
		resizeObserver.observe(vmNode);
		pc.addPoint([left, top]);
	});

	$: if (left && top) {
		pc.addPoint([left, top]);
	}
</script>

<div class="cursor" style:--adjustedLeft={adjustedLeft} style:--adjustedTop={adjustedTop}>
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
		position: absolute;
		left: 0;
		top: 0;
		width: 32px;
		height: 32px;
		pointer-events: none;

		transform: translate(calc(var(--adjustedLeft) * 1px), calc(var(--adjustedTop) * 1px));

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
