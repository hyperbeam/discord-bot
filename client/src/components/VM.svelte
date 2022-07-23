<script lang="ts">
  import Hyperbeam from "@hyperbeam/iframe";
  export let embedUrl: string;

  async function startHyperbeamSession(url) {
    const hbiframe = document.getElementById(
      "hyperbeam"
    ) as HTMLIFrameElement | null;
    if (hbiframe) return Hyperbeam(hbiframe, url);
  }
  // TODO: consolidate api interactions in one place?
  $: hbSession = startHyperbeamSession(embedUrl);
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
