/* eslint-disable no-unused-vars */
import { nanoid } from "nanoid";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { authorizeUser, isLoggedIn, oauthUrl, UserProps, verifyUser } from "../scripts/auth";

function reAuth() {
	const oauthState = nanoid();
	localStorage.setItem("oauthState", oauthState);
	window.location.href = oauthUrl(oauthState);
}

function handleAuth(props: UserProps, navigate) {
	if (isLoggedIn()) {
		verifyUser().then(user => {
			if (user) {
				props.setUser(user);
				navigate("/");
			}
			else reAuth();
		});
	}
	else {
		const href = window.location.href;
		const params = new URLSearchParams(href.substring(href.indexOf("?")));
		const code = params.get("code");
		const state = params.get("state");
		if (!code || !state) reAuth();
		else if (code && state) {
			const oauthState = localStorage.getItem("oauthState");
			if (oauthState !== state) {
				console.log("Invalid OAuth state");
			}
			authorizeUser(code).then(user => {
				if (user)
					props.setUser(user);
				else
					navigate("/");
			});
		}
	}
}

export default function oauthHandler(props: UserProps) {
	const navigate = useNavigate();
	useEffect(() => {
		handleAuth(props, navigate);
	});
	return <div>Loading...</div>;
}