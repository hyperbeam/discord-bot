/* eslint-disable no-unused-vars */
import "./Header.css";

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { isLoggedIn, UserData, verifyUser } from "../../scripts/auth";
import Avatar from "../Avatar/Avatar";
function logout(callback) {
	localStorage.removeItem("token");
	callback(null);
}

interface IProps {
	user?: UserData;
	setUser: (user: UserData) => void;
	isVmLoaded: boolean;
}

export function Header(props: IProps) {
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
			<h3 className="header-logo">
				{`${user?.username}'s room`}
			</h3>
		</div>
		<div className="header-right">
			{
				//TODO: Replace with share button after implementing modal
				props.isVmLoaded ? (
					<button onClick={() => {
						navigator.clipboard.writeText(window.location.href);
					}}>Copy invite link</button>
				) : null
			}
			{
				user ? (
					<button onClick={() => logout(props.setUser)} className="logout">
						Logout
					</button>
				) : (
					<button onClick={() => navigate("/authorize")} className="login">
						Login
					</button>
				)
			}
			{
				user ? (
					<Avatar img={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}`} alt={user.username} />
				) : null
			}
		</div>
	</div>;
}