<script lang="ts">
  import Hyperbeam from "@hyperbeam/web";
  import { onMount } from "svelte";
  export let embedUrl: string;

  async function startHyperbeamSession(url) {
  	const hbiframe = document.getElementById(
  		"hyperbeam",
  	) as HTMLIFrameElement | null;
  	if (hbiframe) return Hyperbeam(hbiframe, url);
  }
  // TODO: consolidate api interactions in one place?
  $: startHyperbeamSession(embedUrl);

  onMount(async () => {
  	if (embedUrl) startHyperbeamSession(embedUrl);
  });
</script>

<div id="VM">
  <iframe id="hyperbeam" title="Hyperbeam" />
</div>

<style>
  #hyperbeam {
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 9; /* TODO: check support */
  }
</style>
