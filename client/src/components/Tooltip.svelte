<script lang="ts">
  import { fade } from "svelte/transition";
  export let text: string;
  // TODO: Account for the tooltip being positioned outside of the viewport
  let isVisible = false;
</script>

<div
  class="tooltip"
  on:focus={() => (isVisible = true)}
  on:mouseover={() => (isVisible = true)}
  on:blur={() => (isVisible = false)}
  on:mouseout={() => (isVisible = false)}
>
  {#if isVisible}
    <div class="tooltip__text" transition:fade={{ duration: 150 }} >
      {text}
    </div>
  {/if}
  <slot />
</div>

<style>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip__text {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translate(-50%, -100%);
    background-color: grey;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    padding: 4px 8px;
    border-radius: 4px;
}
</style>
