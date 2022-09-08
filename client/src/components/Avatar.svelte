<script lang="ts">
  export let src: string;
  export let alt: string;
  export let borderStyle: "" | "dashed" | "solid" = "";
</script>

<div class={`avatar ${borderStyle}`} on:click>
  <img {src} {alt} />
</div>

<style>
  .avatar {
    aspect-ratio: 1 / 1;
    width: 40px;
    padding: 4px;
    margin: 4px;
    border-radius: 50%;
  }

  .dashed,
  .solid {
    padding: 2px;
  }

  .dashed {
    border: 2px dashed blueviolet;
  }

  .solid {
    border: 2px solid blueviolet;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
