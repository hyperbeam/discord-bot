import { Client, ServerError } from "colyseus";
import Member from "../schemas/member";
import { AuthenticatedClient, BotRoom } from "./room";
import TokenHandler from "../utils/tokenHandler";
import database from "./database";
import Hyperbeam from "./hyperbeam";

export type StartSessionOptions = {
	ownerId: string;
	region: "NA" | "EU" | "AS";
};

type BaseContext = { room: BotRoom; db: typeof database };

interface RoomEvents {
	startSession: BaseContext & { options: StartSessionOptions };
	joinSession: BaseContext & { client: AuthenticatedClient };
	leaveSession: BaseContext & { client: AuthenticatedClient };
	disposeSession: BaseContext;
	authenticateUser: BaseContext & { client: Client; token?: string };
}

export async function authenticateUser(
	ctx: RoomEvents["authenticateUser"],
): Promise<{ token: string | undefined; guest: boolean }> {
	let member: Member | undefined = undefined;
	if (!ctx.token) {
		ctx.room.guestCount++;
		member = new Member();
		member.id = ctx.client.sessionId;
		member.name = `Guest ${ctx.room.guestCount}#0000`;
		member.avatarUrl = `https://cdn.discordapp.com/embed/avatars/${ctx.room.guestCount % 5}.png`;
	} else if (ctx.token) {
		const result = TokenHandler.verify(ctx.token);
		if (!result) throw new ServerError(401, "Invalid token");
		const { id, verify } = result;
		const user = await ctx.db.user.findFirst({ where: { id } });
		if (!user) throw new ServerError(401, "Invalid token");
		if (!verify(user)) throw new ServerError(401, "Invalid token");
		member = new Member();
		member.id = user.id;
		member.name = user.username + "#" + user.discriminator;
		member.avatarUrl = user.avatar
			? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
			: `https://cdn.discordapp.com/embed/avatars/${+user.discriminator % 5}.png`;
	}
	if (!member) throw new ServerError(401, "Could not authenticate user");
	ctx.client.userData = member;
	return { token: ctx.token, guest: !ctx.token };
}

export async function startSession(ctx: RoomEvents["startSession"]) {
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

export async function joinSession(ctx: RoomEvents["joinSession"]) {
	const member = ctx.client.userData;
	if (!member) return;
	ctx.room.state.members.set(member.id, member);
	if (ctx.client.auth.guest) return;
	const user = await ctx.db.user.findFirst({ where: { id: member.id } });
	if (!user) return;
	await ctx.db.session.update({
		where: { url: ctx.room.roomId },
		data: {
			members: {
				upsert: { where: { id: member.id }, create: user, update: user },
			},
		},
	});
}

export async function leaveSession(ctx: RoomEvents["leaveSession"]) {
	const member = ctx.client.userData;
	if (!member) return;
	ctx.room.state.members.delete(member.id);
	if (ctx.client.auth.guest) return;
	const user = await ctx.db.user.findFirst({ where: { id: member.id } });
	if (!user) return;
	await ctx.db.session.update({
		where: { url: ctx.room.roomId },
		data: {
			members: {
				upsert: { where: { id: member.id }, create: user, update: user },
			},
		},
	});
}

export async function disposeSession(ctx: RoomEvents["disposeSession"]) {
	if (!ctx.room.session) return;
	await ctx.db.session.update({
		where: { sessionId: ctx.room.session.sessionId },
		data: {
			endedAt: new Date(),
		},
	});
}

export async function getActiveSessions(ownerId: string) {
	return database.session.findMany({ where: { ownerId, endedAt: { not: null } } });
}
