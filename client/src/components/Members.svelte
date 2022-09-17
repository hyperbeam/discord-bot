<script lang="ts">
	import { members } from "../store";
	import Avatar from "./Avatar.svelte";
	import Invite from "./Invite.svelte";
	import Tooltip from "./Tooltip.svelte";

	const getBorderStyle = (state: "enabled" | "requesting" | "disabled"): "solid" | "dashed" | "none" => {
		switch (state) {
			case "enabled":
				return "solid";
			case "requesting":
				return "dashed";
			case "disabled":
				return "none";
		}
	};
</script>

<div class="members">
	{#each $members as member}
		<Tooltip text={member.name}>
			<Avatar src={member.avatarUrl} alt={member.name} borderStyle={getBorderStyle(member.control)} />
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
