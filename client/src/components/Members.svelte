<script lang="ts">
	import { roomState } from "../store";
	import Avatar from "./Avatar.svelte";
	import Invite from "./Invite.svelte";
	import Tooltip from "./Tooltip.svelte";
</script>

<div class="members">
	{#each Array.from($roomState.members) as [_, member]}
		{@const { name } = member}
		<Tooltip text={name}>
			<Avatar src={member.avatarUrl} alt={name} borderStyle={member.hasControl ? "solid" : "dashed"} />
		</Tooltip>
	{/each}
	<Invite />
</div>

<style>
	.members {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	@media screen and (max-width: 767px) {
		.members {
			flex-wrap: wrap;
		}
	}
</style>
