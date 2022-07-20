/* eslint-disable no-unused-vars */
import { nanoid } from "nanoid";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { authorizeUser, isLoggedIn, oauthUrl, UserProps, verifyUser } from "../scripts/auth";

// oauthState is used to prevent CSRF attacks
function reAuth() {
	const oauthState = nanoid();
	localStorage.setItem("oauthState", oauthState);
	window.location.href = oauthUrl(oauthState);
}

// this logic could probs also be moved to auth.ts
function handleAuth(props: UserProps, navigate) {
	if (isLoggedIn()) { // check if token exists
		verifyUser().then(user => {
			if (user) {
				props.setUser(user);
				navigate("/"); // redirect to home
			}
			else reAuth(); // if token is not valid, re-auth
		});
	}
	else {
		const href = window.location.href;
		const params = new URLSearchParams(href.substring(href.indexOf("?")));
		const code = params.get("code");
		const state = params.get("state");
		if (!code || !state) reAuth(); // if no token + no code, re-auth
		else if (code && state) {
			const oauthState = localStorage.getItem("oauthState");
			if (oauthState !== state) {
				console.log("Invalid OAuth state");
			}
			authorizeUser(code).then(user => {
				if (user)
					props.setUser(user);
				else
					navigate("/"); // redirect to root after auth failed
			});
		}
	}
}

export default function oauthHandler(props: UserProps) {
	const navigate = useNavigate();
	useEffect(() => {
		handleAuth(props, navigate); // allow handleAuth to navigate on load
	});
	return <div>Loading...</div>;
}