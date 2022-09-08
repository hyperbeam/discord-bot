import { Client } from "colyseus";
import Member from "../schemas/member";
import { AuthenticatedClient, BotRoom, RoomCreateOptions } from "./room";
import TokenHandler from "../utils/tokenHandler";
import database from "./database";
import Hyperbeam from "./hyperbeam";

type BaseContext = { room: BotRoom; db: typeof database };

interface RoomEvents {
	createRoom: BaseContext & { options: RoomCreateOptions };
	joinRoom: BaseContext & { client: AuthenticatedClient };
	leaveRoom: BaseContext & { client: AuthenticatedClient };
	disposeRoom: BaseContext;
	authenticateUser: BaseContext & { client: Client; token?: string };
}

export async function authenticateUser(ctx: RoomEvents["authenticateUser"]) {
	let member: Member | undefined = undefined;
	if (ctx.client.auth.guest) {
		ctx.room.guestCount++;
		member = new Member();
		member.id = ctx.client.sessionId;
		member.name = `Guest ${ctx.room.guestCount}#0000`;
		member.avatarUrl = `https://cdn.discordapp.com/embed/avatars/${ctx.room.guestCount % 5}.png`;
	} else if (ctx.client.auth.token) {
		const result = TokenHandler.verify(ctx.client.auth.token);
		if (!result) return;
		const { id, verify } = result;
		const user = await ctx.db.user.findFirst({ where: { id } });
		if (!user) return;
		if (!verify(user)) return;
		member = new Member();
		member.id = user.id;
		member.name = user.username + "#" + user.discriminator;
		member.avatarUrl = user.avatar
			? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
			: `https://cdn.discordapp.com/embed/avatars/${+user.discriminator % 5}.png`;
	}
	if (!member) return;
	ctx.client.userData = { id: member.id };
	return member;
}

export async function createRoom(ctx: RoomEvents["createRoom"]) {
	ctx.room.guestCount = 0;
	const hbSession = await Hyperbeam.createSession({
		region: ctx.options.region,
	});
	const session = await ctx.db.session.create({
		data: {
			embedUrl: hbSession.embedUrl,
			sessionId: hbSession.sessionId,
			adminToken: hbSession.adminToken,
			ownerId: ctx.options.ownerId,
			createdAt: new Date(),
			url: ctx.room.roomId,
		},
	});
	ctx.room.session = { ...session, instance: hbSession };
	ctx.room.state.embedUrl = hbSession.embedUrl;
	ctx.room.state.sessionId = hbSession.sessionId;
}

export async function joinRoom(ctx: RoomEvents["joinRoom"]) {
	const member = ctx.client.auth;
	if (!member) return;
	ctx.room.state.members.set(member.id, member);
}

export async function leaveRoom(ctx: RoomEvents["leaveRoom"]) {
	const member = ctx.client.auth;
	if (!member) return;
	ctx.room.state.members.delete(member.id);
}

export async function disposeRoom(ctx: RoomEvents["disposeRoom"]) {
	if (!ctx.room.session) return;
	await ctx.db.session.delete({ where: { sessionId: ctx.room.session.sessionId } });
}
