import React from "react";

export interface UserData {
	id: string;
	username: string;
	avatar: string;
	avatar_decoration: string | null;
	discriminator: string;
	banner: string | null;
	email: string | null;
	verified: boolean;
}

interface IProps {
	user: UserData;
}

export default class User extends React.Component<IProps> {
	render() {
		const user = this.props.user;
		return <div>
			<img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`} alt="User Avatar" />
			<div>{user.username + "#" + user.discriminator}</div>
			<div>{user.verified ? "Verified" : "Unverified"}</div>
		</div>;
	}
}