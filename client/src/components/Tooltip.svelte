<script lang="ts">
  export let text: string;
  // TODO: Account for the tooltip being positioned outside of the viewport
</script>

<div class="tooltip">
  <div class="tooltip__text">
    {text}
  </div>
  <slot />
</div>

<style>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip__text {
    visibility: hidden;
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translate(-50%, -100%);
    background-color: grey;
  }

  .tooltip:hover .tooltip__text {
    visibility: visible;
  }
</style>
