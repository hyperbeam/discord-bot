<script lang="ts">
  import Hyperbeam from "@hyperbeam/web";
  import { onMount } from "svelte";
  import { hb } from "../scripts/state";

  export let embedUrl: string;
  let iframe: HTMLIFrameElement;

  onMount(() => {
    Hyperbeam(iframe, embedUrl).then((hyperbeamIFrame) => {
      $hb = hyperbeamIFrame;
    });
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
