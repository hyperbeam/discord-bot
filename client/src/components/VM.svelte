<script lang="ts">
	import Hyperbeam, { HyperbeamIFrame } from "@hyperbeam/web";
	import { onMount } from "svelte";

	import { hbSession } from "../scripts/state";
	export let embedUrl: string;

	async function startHyperbeamSession(url: string): Promise<HyperbeamIFrame> {
		const hbiframe = document.getElementById("hyperbeam") as HTMLIFrameElement | undefined;
		if (hbiframe) {
			const data = await Hyperbeam(hbiframe, url);
			$hbSession = data;
			return data;
		}
	}

	onMount(async () => {
		if (embedUrl) {
			console.log("Starting hyperbeam session");
			startHyperbeamSession(embedUrl);
		}
	});
</script>

<div id="VM">
	<iframe id="hyperbeam" title="Hyperbeam" />
</div>

<style>
	#VM {
		height: calc(100vh - 64px);
		width: 100vw;
	}

	#hyperbeam {
		width: 100%;
		height: 100%;
		aspect-ratio: 16 / 9; /* TODO: check support */
	}
</style>
