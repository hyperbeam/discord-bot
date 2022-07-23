<script lang="ts">
  export let src: string;
  export let alt: string;
  export let borderStyle: "dashed" | "solid";
</script>

<div
  class={`avatar ${
    borderStyle === "dashed"
      ? "avatar-dashed"
      : borderStyle === "solid"
      ? "avatar-solid"
      : ""
  }`}
>
  <img {src} {alt} />
</div>

<style>
  .avatar {
    aspect-ratio: 1 / 1;
    width: 40px;
    padding: 2px;
    border-radius: 50%;
  }

  .avatar-dashed {
    border: 2px dashed blueviolet;
  }

  .avatar-solid {
    border: 2px solid blueviolet;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
