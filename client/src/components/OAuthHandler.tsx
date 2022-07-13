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

	generateRandomString() {
		let randomString = "";
		const randomNumber = Math.floor(Math.random() * 10);
		for (let i = 0; i < 20 + randomNumber; i++) {
			randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
		}
		return btoa(randomString);
	}

	async componentDidMount() {
		const searchParams = new URLSearchParams(window.location.hash.slice(1));
		const code = searchParams.get("code");

		if (!code) {
			const randomString = this.generateRandomString();
			localStorage.setItem("oauth-state", randomString);
			const oAuthUrl = `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID!}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_CLIENT_BASE_URL!)}%2Fauthorize&response_type=code&scope=identify%20email&state=${randomString}`;
			window.location.href = oAuthUrl;
		}

		const state = searchParams.get("state");
		if (localStorage.getItem("oauth-state") !== state)
			return console.log("You may have been clickjacked!");

		const [accessToken, tokenType] = [searchParams.get("access_token"), searchParams.get("token_type")];
		const response = await fetch("https://discord.com/api/users/@me", {
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