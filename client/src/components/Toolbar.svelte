<script>
  import Members from "./Members.svelte";
  import Volume from "./Volume.svelte";

  $: isFullscreen = false;

  window.addEventListener("fullscreenchange", () => {
    isFullscreen = document.fullscreenElement !== null;
  });

  function requestFullscreen() {
    const element = document.getElementById("VM");
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
</script>

{#if !isFullscreen}
  <div class="toolbar">
    <div class="toolbar__left">
      <Volume />
    </div>
    <Members />
    <div class="toolbar__right">
      <div class="icon" on:click={requestFullscreen}>
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"
          />
        </svg>
      </div>
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

  :global(.members) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .toolbar__left {
    flex: 1;
    display: flex;
    justify-content: flex-start;
  }

  .toolbar__right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  @media screen and (max-width: 767px) {
    .toolbar {
      display: grid;
      grid-template-areas:
        "members members"
        "left right";
    }

    .toolbar__left {
      grid-area: left;
    }

    .toolbar__right {
      grid-area: right;
    }

    :global(.members) {
      grid-area: members;
      position: static;
      transform: none;
      flex-wrap: wrap;
    }
  }
</style>
