<script lang="ts">
  import { currentRoom, currentUser } from "../scripts/state";
  import { User } from "../scripts/types";
  import Avatar from "./Avatar.svelte";
  import Invite from "./Invite.svelte";
  import Tooltip from "./Tooltip.svelte";

  enum Control {
    DISABLED,
    ENABLED,
    REQUESTING,
  }

  interface Member {
    id: string;
    user: User;
    control: Control;
  }

  let members: Member[] = [
    {
      id: "1",
      user: {
        id: "1",
        username: "Alice",
        avatar: "https://source.boringavatars.com/beam/128/1",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "2",
      user: {
        id: "2",
        username: "Bob",
        avatar: "https://source.boringavatars.com/beam/128/2",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "3",
      user: {
        id: "3",
        username: "Charlie",
        avatar: "https://source.boringavatars.com/beam/128/3",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "4",
      user: {
        id: "4",
        username: "David",
        avatar: "https://source.boringavatars.com/beam/128/4",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "5",
      user: {
        id: "5",
        username: "Eve",
        avatar: "https://source.boringavatars.com/beam/128/5",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "6",
      user: {
        id: "6",
        username: "Frank",
        avatar: "https://source.boringavatars.com/beam/128/6",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "7",
      user: {
        id: "7",
        username: "Grace",
        avatar: "https://source.boringavatars.com/beam/128/7",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "8",
      user: {
        id: "8",
        username: "Heidi",
        avatar: "https://source.boringavatars.com/beam/128/8",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "9",
      user: {
        id: "9",
        username: "Ivan",
        avatar: "https://source.boringavatars.com/beam/128/9",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
    {
      id: "10",
      user: {
        id: "10",
        username: "Judy",
        avatar: "https://source.boringavatars.com/beam/128/10",
        discriminator: "",
        email: "",
      },
      control: Control.ENABLED,
    },
  ];

  //TODO: Get the members from the server

  function updateControl(member: Member, control: Control) {
    const index = members.findIndex((m) => m.id === member.id);
    members = [
      ...members.slice(0, index),
      { ...member, control },
      ...members.slice(index + 1),
    ];
    // TODO: send control update to server
  }
</script>

<div class="members">
  {#each members as member}
    <Tooltip text={member.user.username}>
      <Avatar
        src={member.user.avatar}
        alt={member.user.username}
        borderStyle={member.control === Control.REQUESTING
          ? "dashed"
          : member.control === Control.ENABLED
          ? "solid"
          : ""}
        on:click={() => {
          // The owner of the room always has control.
          // The owner of the room can click on any member to enable or disable control for that member.
          // Other members can only click on themselves to request control.
          if ($currentUser.id === $currentRoom.ownerId) {
            if (member.control === Control.DISABLED) {
              updateControl(member, Control.ENABLED);
            } else {
              updateControl(member, Control.DISABLED);
            }
          } else if (member.user.id === $currentUser.id) {
            // This does not work if the user is not logged in.
            updateControl(member, Control.REQUESTING);
          }
        }}
      />
    </Tooltip>
  {/each}
  <Invite />
</div>

<style>
  .members {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
  }

  @media screen and (max-width: 767px) {
    .members {
      flex-wrap: wrap;
    }
  }
</style>
