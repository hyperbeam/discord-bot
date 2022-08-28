<script>
  import Tooltip from "./Tooltip.svelte";

  $: isFullscreen = false;

  window.addEventListener("fullscreenchange", () => {
    isFullscreen = document.fullscreenElement !== null;
  });

  function requestFullscreen() {
    document.documentElement.requestFullscreen();
  }
</script>

{#if !isFullscreen}
  <div class="toolbar">
    <div class="icon" on:click={requestFullscreen}>
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"
        />
      </svg>
    </div>
  </div>
{/if}

<style>
  .toolbar {
    display: flex;
    align-items: center;
  }

  .icon {
    margin: 4px;
    width: 40px;
    height: 40px;
    padding: 8px;
    cursor: pointer;
    border-radius: 8px;
  }

  .icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .icon:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
