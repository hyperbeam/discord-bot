<script lang="ts">
	import type Member from "../schemas/member";
	import { currentUser, members, room } from "../store";
	import Avatar from "./Avatar.svelte";
	import Invite from "./Invite.svelte";
	import Tooltip from "./Tooltip.svelte";

	const getBorderStyle = (state: Member["control"]): "solid" | "dashed" | "none" => {
		switch (state) {
			case "enabled":
				return "solid";
			case "requesting":
				return "dashed";
			case "disabled":
				return "none";
		}
	};

	async function setControl(target: Member) {
		if (!$room || !$currentUser) return;

		if ($room.state.ownerId === $currentUser.id)
			return $room.send("setControl", {
				targetId: target.id,
				control: target.control === "enabled" ? "disabled" : "enabled",
			});

		if (target.id === $currentUser.id)
			return $room.send("setControl", {
				targetId: target.id,
				control: target.control === "disabled" ? "requesting" : "disabled",
			});
	}

	function handleAvatarKeypress(event: KeyboardEvent, member: Member) {
		if (event.key === "Enter") setControl(member);
	}
</script>

<div class="members">
	{#each $members as member}
		<Tooltip text={member.name}>
			<div class="member" on:click={() => setControl(member)} on:keypress={(e) => handleAvatarKeypress(e, member)}>
				<Avatar src={member.avatarUrl} alt={member.name} borderStyle={getBorderStyle(member.control)} />
			</div>
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

	.member {
		cursor: pointer;
	}

	@media screen and (max-width: 767px) {
		.members {
			flex-wrap: wrap;
		}
	}
</style>
