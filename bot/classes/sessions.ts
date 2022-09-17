import { Client, ServerError } from "colyseus";
import Member from "../schemas/member";
import { AuthenticatedClient, AuthOptions, BotRoom } from "./room";
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
	authenticateUser: BaseContext & { client: Client } & AuthOptions;
}

export async function authenticateUser(
	ctx: RoomEvents["authenticateUser"],
): Promise<{ token: string | undefined; guest: boolean; deviceId: string }> {
	let member: Member | undefined = undefined;
	if (!ctx.token) {
		const id = ctx.deviceId || ctx.client.sessionId;
		const existingGuestClient = ctx.room.clients.find((c) => c.auth?.deviceId === id);
		if (existingGuestClient) {
			member = existingGuestClient.userData;
		} else {
			member = new Member();
			member.id = id;
			member.name = "Guest ";
			let guestNumber = 1;
			while (ctx.room.guests.includes(guestNumber)) guestNumber++;
			ctx.room.guests.push(guestNumber);
			member.name += guestNumber;
			member.avatarUrl = `https://cdn.discordapp.com/embed/avatars/${guestNumber % 5}.png`;
		}
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
	return { token: ctx.token, guest: !ctx.token, deviceId: ctx.deviceId || ctx.client.sessionId };
}

export async function startSession(ctx: RoomEvents["startSession"]) {
	let hbSession: Awaited<ReturnType<typeof Hyperbeam.createSession>>;
	try {
		hbSession = await Hyperbeam.createSession({
			region: ctx.options.region || "NA",
		});
	} catch (e) {
		throw new ServerError(500, "Could not create session");
	}
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
				connect: { id: user.id },
			},
		},
	});
}

export async function leaveSession(ctx: RoomEvents["leaveSession"]) {
	const member = ctx.client.userData;
	if (!member) return;
	ctx.room.state.members.delete(member.id);
	if (ctx.client.auth.guest) {
		const guestNumber = +member.name.split(" ")[1];
		ctx.room.guests.splice(ctx.room.guests.indexOf(guestNumber), 1);
		return;
	}
	const user = await ctx.db.user.findFirst({ where: { id: member.id } });
	if (!user) return;
	await ctx.db.session.update({
		where: { url: ctx.room.roomId },
		data: {
			members: {
				connect: { id: user.id },
			},
		},
	});
}

export async function disposeSession(ctx: RoomEvents["disposeSession"]) {
	if (!ctx.room.session) return;
	await Hyperbeam.deleteSession(ctx.room.session.sessionId);
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

export async function endAllSessions() {
	const sessions = await database.session.findMany();
	for (const session of sessions) {
		await Hyperbeam.deleteSession(session.sessionId).catch();
	}
}
