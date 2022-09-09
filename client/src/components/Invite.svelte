<script>
  import Tooltip from "./Tooltip.svelte";
  let tooltipText = "Invite";
</script>

<Tooltip text={tooltipText}>
  <div
    class="icon"
    on:click={() => {
      tooltipText = "Copied invite link to clipboard";
      setTimeout(() => {
        tooltipText = "Invite";
      }, 5000);
      navigator.clipboard.writeText(window.location.href);
    }}
  >
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"
      />
    </svg>
  </div>
</Tooltip>

<style>
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
