import Discord from "discord-oauth2";
import db from "./database";
import { User as BotUser } from "slash-create";
import fetch from "node-fetch";
import TokenHandler from "../utils/tokenHandler";
import { nanoid } from "nanoid";

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
	discriminator: string;
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

	const userData = {
		id: user.id,
		username: user.username,
		discriminator: user.discriminator,
		avatar: user.avatar,
		email: user.email,
		refreshToken: authorizationData.refresh_token,
		accessToken: authorizationData.access_token,
	};

	const hash = nanoid();

	const dbUser = await db.user.upsert({
		where: {
			id: user.id,
		},
		create: { ...userData, hash },
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

	const token = TokenHandler.generate(dbUser.id, hash);
	return { ...dbUser, token };
}

export async function updateUser(user: BotUser): Promise<BasicUser> {
	return db.user.update({
		where: {
			id: user.id,
		},
		data: {
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
