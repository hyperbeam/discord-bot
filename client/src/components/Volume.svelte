<script lang="ts">
  import { hb } from "../scripts/state";

  let isMuted = false;
  let volume = 1.0;
  $: $hb.volume = isMuted ? 0 : volume;
</script>

<div class="volume">
  {#if isMuted}
    <div
      class="icon"
      on:click={() => {
        isMuted = false;
      }}
    >
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
        />
      </svg>
    </div>
  {:else}
    <div
      class="icon"
      on:click={() => {
        isMuted = true;
      }}
    >
      {#if volume > 0.5}
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
          />
        </svg>
      {:else if volume > 0}
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
          />
        </svg>
      {:else}
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M7,9V15H11L16,20V4L11,9H7Z" />
        </svg>
      {/if}
    </div>
  {/if}
  <input
    type="range"
    min="0"
    max="1"
    step="0.1"
    bind:value={volume}
    on:mousedown={() => {
      isMuted = false;
    }}
  />
</div>

<style>
  .volume {
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
