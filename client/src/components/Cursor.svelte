<script lang="ts">
	import { onMount } from "svelte";

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

	function adjustPosition() {
		const vmNodeRect = vmNode.getBoundingClientRect();
		adjustedLeft = vmNodeRect.left + left * vmNodeRect.width;
		adjustedTop = vmNodeRect.top + top * vmNodeRect.height;
	}

	const resizeObserver = new ResizeObserver(adjustPosition);
	onMount(async () => {
		adjustPosition();
		resizeObserver.observe(vmNode);
	});

	$: if (left && top) adjustPosition();
</script>

<div class="cursor" style:--adjustedLeft={adjustedLeft} style:--adjustedTop={adjustedTop}>
	<div class="cursor__icon">
		<!-- TODO: Show platform-specific cursor -->
		<svg style="width:24px;height:24px" viewBox="0 0 24 24">
			<path
				fill="currentColor"
				d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z" />
		</svg>
	</div>
	<div class="cursor__text">{text}</div>
</div>

<style lang="scss">
	.cursor {
		position: absolute;
		left: calc(var(--adjustedLeft) * 1px);
		top: calc(var(--adjustedTop) * 1px);
		width: 24px;
		height: 24px;

		&__icon {
			path {
				fill: #fff;
				stroke: #000;
				stroke-width: 2px;
			}
		}

		&__text {
			position: absolute;
			left: 24px;
			top: 24px;
			background-color: grey;
			font-size: 12px;
			white-space: nowrap;
			position: absolute;
			box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
			padding: 4px 8px;
			border-radius: 4px;
		}
	}
</style>
