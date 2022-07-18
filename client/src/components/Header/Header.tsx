/* eslint-disable no-unused-vars */
import "./Header.css";

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { isLoggedIn, UserProps, verifyUser } from "../../scripts/auth";

function logout(callback) {
	localStorage.removeItem("token");
	callback(null);
}

export function Header(props: UserProps) {
	const navigate = useNavigate();
	const user = props.user;
	useEffect(() => {
		if (!user && isLoggedIn()) {
			verifyUser().then(user => {
				if (user)
					props.setUser(user);
			});
		}
	}, [user]);
	return <div className="header">
		<div className="header-left">
			<h2 className="header-logo">
				Hyperbeam Bot
			</h2>
		</div>
		{
			user ? (
				<div className="header-right">
					<img className="user-avatar" src={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}`} alt="User Avatar" />
					<button onClick={() => logout(props.setUser)} className="logout">
						Logout
					</button>
				</div>
			) : (
				<div className="header-right">
					<button onClick={() => navigate("/authorize")} className="login">
						Login
					</button>
				</div>
			)
		}
	</div>;
}