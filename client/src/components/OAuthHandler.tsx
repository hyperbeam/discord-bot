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
		const searchParams = new URLSearchParams(window.location.href.substring(window.location.href.indexOf("?")));
		const code = searchParams.get("code");

		console.log({ searchParams, href: window.location.href });

		if (!code) {
			const randomString = this.generateRandomString();
			localStorage.setItem("oauth-state", randomString);
			const oAuthUrl = `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID!}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_CLIENT_BASE_URL!)}%2Fauthorize&response_type=code&scope=identify%20email&state=${randomString}`;
			window.location.href = oAuthUrl;
			return;
		}

		const state = searchParams.get("state");
		if (localStorage.getItem("oauth-state") !== state)
			return console.log("You may have been clickjacked!");

		const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}/authorize/${code}`);
		console.log({ response, body: JSON.stringify(response.body) });
		if (!response.ok)
			return console.log("Could not authorize user.");

		const data = await response.json();
		localStorage.setItem("userId", data.userId);
		localStorage.setItem("hash", data.hash);
		this.setState({ loaded: true, data });
	}

	render(): ReactNode {
		return <div className="OAuth">
			<h2>OauthThingy</h2>
			{this.state.loaded && <User
				user={this.state.data! as UserData} />}
		</div>;
	}
}