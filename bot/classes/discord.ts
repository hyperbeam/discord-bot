import Discord from "discord-oauth2";
import { nanoid } from "nanoid";
import fetch from "node-fetch";
import { User as BotUser } from "slash-create";

import TokenHandler from "../utils/tokenHandler";
import db from "./database";

// make sure you set the redirect uri to the same url as the one in the discord app
const discord = new Discord({
	clientId: process.env.DISCORD_CLIENT_ID,
	clientSecret: process.env.DISCORD_CLIENT_SECRET,
	redirectUri: process.env.VITE_CLIENT_BASE_URL + "/authorize",
});

type BasicUser = {
	id: string;
	avatar: string | null;
	username: string;
	discriminator: string | null;
};

type AuthorizedUserData = BasicUser & { token: string };

export async function authorize(code: string): Promise<AuthorizedUserData> {
	const authorizationData = await fetch("https://discordapp.com/api/oauth2/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: process.env.VITE_CLIENT_BASE_URL! + "/authorize",
			client_id: process.env.DISCORD_CLIENT_ID!,
			client_secret: process.env.DISCORD_CLIENT_SECRET!,
		}).toString(),
	}).then((response) => response.json() as unknown as Discord.TokenRequestResult);

	// we should get back an access and refresh token
	if (!authorizationData.access_token || !authorizationData.refresh_token) throw new Error("Could not authorize user");

	// get the user info from the discord api
	const user = await discord.getUser(authorizationData.access_token);
	if (!user) throw new Error("Invalid user");

	const existingUser = await db.user.findFirst({ select: { hash: true }, where: { id: user.id } });
	const hash = existingUser?.hash || nanoid();

	const userData = {
		id: user.id,
		username: user.username,
		discriminator: user.discriminator,
		avatar: user.avatar,
		email: user.email,
		refreshToken: authorizationData.refresh_token,
		accessToken: authorizationData.access_token,
		hash,
	};

	const dbUser = await db.user.upsert({
		where: {
			id: user.id,
		},
		create: userData,
		update: userData,
		select: {
			id: true,
			username: true,
			discriminator: true,
			avatar: true,
			email: false,
			refreshToken: false,
			accessToken: false,
			hash: false,
		},
	});

	const token = TokenHandler.generate(dbUser.id, userData.hash);
	return { ...dbUser, token };
}

export async function updateUser(user: BotUser): Promise<BasicUser> {
	return db.user.upsert({
		where: {
			id: user.id,
		},
		create: {
			id: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
		},
		update: {
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
		},
		select: {
			id: true,
			username: true,
			discriminator: true,
			avatar: true,
			email: false,
			refreshToken: false,
			accessToken: false,
			hash: false,
		},
	});
}

export default {
	discord,
	authorize,
	updateUser,
};
