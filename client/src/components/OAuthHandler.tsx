import React from "react";
import { ReactNode } from "react";
import User, { UserData } from "./User";

interface IProps { }

interface IState {
	loaded: boolean;
	data?: object;
}

export default class OAuthHandler extends React.Component<IProps, IState> {
	constructor(props) {
		super(props);
		this.state = { loaded: false };
	}

	async componentDidMount() {
		const searchParams = new URLSearchParams(window.location.hash.slice(1));
		if (!searchParams.has('access_token') || !searchParams.has('token_type')) {
			window.location.href = import.meta.env.VITE_OAUTH_URL;
		}
		const [accessToken, tokenType] = [searchParams.get('access_token'), searchParams.get('token_type')];
		const response = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `${tokenType} ${accessToken}`,
			},
		}).then(res => res.json());
		this.setState({ loaded: true, data: response });
	}

	render(): ReactNode {
		return <div className="OAuth">
			<h2>OauthThingy</h2>
			{this.state.loaded && <User
				user={this.state.data! as UserData} />}
		</div>;
	}
}