<script lang="ts">
  import Hyperbeam from "@hyperbeam/iframe";
  export let embedUrl: string;

  // TODO: consolidate api interactions in one place?
  async function startHyperbeamSession() {
    const hbiframe = document.getElementById(
      "hyperbeam"
    ) as HTMLIFrameElement | null;
    if (hbiframe) return Hyperbeam(hbiframe, embedUrl);
  }
</script>

<div id="VM">
  <iframe
    id="hyperbeam"
    title="Hyperbeam"
    on:load={() => startHyperbeamSession()}
  />
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
