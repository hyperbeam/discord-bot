import { Client, matchMaker, ServerError } from "colyseus";
import Member from "../schemas/member";
import { AuthenticatedClient, AuthOptions, BotRoom } from "./room";
import TokenHandler from "../utils/tokenHandler";
import db from "./database";
import Hyperbeam, { HyperbeamSession } from "./hyperbeam";
import Cursor from "../schemas/cursor";
import { Session, User } from "@prisma/client";
import color, { swatches } from "../utils/color";

export type StartSessionOptions = {
	ownerId: string;
	region: "NA" | "EU" | "AS";
	url?: string;
	existingSession?: BotRoom["session"] & { members?: User[] };
};

type BaseContext = { room: BotRoom };
type AuthContext = BaseContext & { client: AuthenticatedClient };

export async function authenticateUser(
	ctx: BaseContext & { client: Client } & AuthOptions,
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
			member.color = color(id) || swatches[Math.floor(Math.random() * swatches.length)];
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
		const user = await db.user.findFirst({ where: { id } });
		if (!user) throw new ServerError(401, "Invalid token");
		if (!verify(user)) throw new ServerError(401, "Invalid token");
		member = new Member();
		member.isAuthenticated = true;
		member.id = user.id;
		member.color = color(user.id) || swatches[Math.floor(Math.random() * swatches.length)];
		member.name = user.username + "#" + user.discriminator;
		member.avatarUrl = user.avatar
			? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
			: `https://cdn.discordapp.com/embed/avatars/${+user.discriminator % 5}.png`;
	}
	if (!member) throw new ServerError(401, "Could not authenticate user");
	ctx.client.userData = member;
	ctx.client.send("identify", { id: member.id });
	return { token: ctx.token, guest: !ctx.token, deviceId: ctx.deviceId || ctx.client.sessionId };
}

export async function startSession(ctx: BaseContext & { options: StartSessionOptions }) {
	let hbSession: Awaited<ReturnType<typeof Hyperbeam.createSession>>;
	const existingSession = ctx.options.existingSession;
	if (existingSession && existingSession.instance) {
		ctx.room.session = existingSession;
		ctx.room.state.embedUrl = existingSession.embedUrl;
		ctx.room.state.sessionId = existingSession.sessionId;
		// if (existingSession.members?.length) {
		// 	for (const member of existingSession.members) {
		// 		const m = new Member();
		// 		m.id = member.id;
		// 		m.color = color(member.id) || swatches[Math.floor(Math.random() * swatches.length)];
		// 		m.name = member.username + "#" + member.discriminator;
		// 		m.avatarUrl = member.avatar
		// 			? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png`
		// 			: `https://cdn.discordapp.com/embed/avatars/${+member.discriminator % 5}.png`;
		// 		ctx.room.state.members.set(m.id, m);
		// 	}
		// }
	} else {
		try {
			hbSession = await Hyperbeam.createSession({
				region: ctx.options.region || "NA",
			});
		} catch (e) {
			throw new ServerError(500, "Could not create session");
		}
		const session = await db.session.create({
			data: {
				embedUrl: hbSession.embedUrl,
				sessionId: hbSession.sessionId,
				adminToken: hbSession.adminToken,
				ownerId: ctx.options.ownerId,
				createdAt: new Date(),
				url: ctx.room.roomId,
				region: ctx.options.region,
			},
		});
		if (!ctx.room.state.ownerId) ctx.room.state.ownerId = ctx.options.ownerId;
		ctx.room.session = { ...session, instance: hbSession };
		ctx.room.state.embedUrl = hbSession.embedUrl;
		ctx.room.state.sessionId = hbSession.sessionId;
	}
}

export async function joinSession(ctx: AuthContext) {
	const member = ctx.client.userData;
	if (!member) return;
	ctx.room.state.members.set(member.id, member);
	if (ctx.client.auth.guest) return;
	const user = await db.user.findFirst({ where: { id: member.id } });
	if (!user) return;
	await db.session.update({
		where: { url: ctx.room.roomId },
		data: {
			members: {
				connect: { id: user.id },
			},
		},
	});
}

export async function leaveSession(ctx: AuthContext) {
	const member = ctx.client.userData;
	if (!member) return;
	ctx.room.state.members.delete(member.id);
	if (ctx.client.auth.guest) {
		const guestNumber = +member.name.split(" ")[1];
		ctx.room.guests.splice(ctx.room.guests.indexOf(guestNumber), 1);
		return;
	}
	const user = await db.user.findFirst({ where: { id: member.id } });
	if (!user) return;
	await db.session.update({
		where: { url: ctx.room.roomId },
		data: {
			members: {
				connect: { id: user.id },
			},
		},
	});
}

export async function disposeSession(ctx: BaseContext) {
	if (!ctx.room.session) return;
	await Hyperbeam.deleteSession(ctx.room.session.sessionId);
	await db.session.update({
		where: { sessionId: ctx.room.session.sessionId },
		data: {
			endedAt: new Date(),
		},
	});
}

export async function getActiveSessions(ownerId: string) {
	return db.session.findMany({ where: { ownerId, endedAt: { not: null } } });
}

export async function endAllSessions() {
	const sessions = await db.session.findMany();
	for (const session of sessions) {
		await Hyperbeam.deleteSession(session.sessionId).catch();
	}
}

export async function connectHbUser(ctx: AuthContext & { hbId: string }) {
	const member = ctx.client.userData;
	if (!member) return;
	member.hbId = ctx.hbId;
}

export async function setControl(ctx: AuthContext & { targetId: string; control: Member["control"] }) {
	const target = ctx.room.state.members.get(ctx.targetId);
	if (!target || target.control === ctx.control) return;
	// making conditions simpler to read
	const isSelf = target.id === ctx.client.userData.id;
	const isOwner = ctx.room.state.ownerId === ctx.client.userData.id;
	const isNotEnabling = ctx.control === "requesting" || ctx.control === "disabled";
	// check conditions for setting control
	if (!target.hbId) {
		console.log(`Hyperbeam user ID not connected to target member ${target.id} (${target.name}).`);
		return;
	}
	if (!ctx.room.session?.instance) {
		console.log("Hyperbeam session not initialized.");
		return;
	}
	if (isOwner) {
		await ctx.room.session.instance.setPermissions(target.hbId, { control_disabled: ctx.control === "disabled" });
		target.control = ctx.control === "disabled" ? "disabled" : "enabled";
	} else if ((isSelf && isNotEnabling) || ctx.client.userData.id === ctx.room.state.ownerId) {
		await ctx.room.session.instance.setPermissions(target.hbId, { control_disabled: ctx.control === "disabled" });
		target.control = ctx.control;
	}
}

export async function setMultiplayer(ctx: AuthContext & { multiplayer: boolean }) {
	if (ctx.room.state.ownerId !== ctx.client.userData.id) return;
	const actions: Promise<void>[] = [];
	if (!ctx.multiplayer) {
		for (const member of ctx.room.state.members.values()) {
			// dont disable control for the owner
			if (member.id === ctx.room.state.ownerId) continue;
			// preserve requesting control state
			if (member.control === "enabled") member.control = "disabled";
			if (member.hbId && ctx.room.session?.instance) {
				// push to array without awaiting so that we can await all at once
				actions.push(ctx.room.session.instance.setPermissions(member.hbId, { control_disabled: true }));
			}
		}
	} else {
		for (const member of ctx.room.state.members.values()) {
			if (member.hbId && ctx.room.session?.instance) {
				// push to array without awaiting so that we can await all at once
				actions.push(ctx.room.session.instance.setPermissions(member.hbId, { control_disabled: false }));
			}
		}
	}
	await Promise.all(actions);
	// set multiplayer after all permissions have been updated
	ctx.room.multiplayer = ctx.multiplayer;
}

export async function setCursor(ctx: AuthContext & { x: number; y: number }) {
	ctx.room.state.members.set(ctx.client.userData.id, ctx.client.userData);
	if (!ctx.client.userData.cursor) ctx.client.userData.cursor = new Cursor();
	if (ctx.client.userData.cursor.x === ctx.x && ctx.client.userData.cursor.y === ctx.y) return;
	if (ctx.x < 0 || ctx.y < 0 || ctx.x > 1 || ctx.y > 1) return;
	ctx.client.userData.cursor.x = ctx.x;
	ctx.client.userData.cursor.y = ctx.y;
}

export async function restartActiveSessions(): Promise<Session[]> {
	const restartedSessions: Session[] = [];
	const sessions = await db.session.findMany({
		where: { endedAt: { equals: null } },
		include: { members: true },
	});
	for (const session of sessions) {
		let instance: HyperbeamSession;
		try {
			instance = await Hyperbeam.getSession(session.sessionId);
		} catch (e) {
			console.error("Failed to get session", e);
			await db.session.update({
				where: { sessionId: session.sessionId },
				data: {
					endedAt: new Date(),
				},
			});
			continue;
		}
		if (instance && !matchMaker.getRoomById(session.url)) {
			try {
				await matchMaker.createRoom("room", {
					url: session.url,
					ownerId: session.ownerId,
					region: session.region,
					existingSession: { ...session, instance },
				} as StartSessionOptions);
			} catch (e) {
				console.error("Failed to create room", e);
				continue;
			}
			restartedSessions.push(session);
		}
	}
	return restartedSessions;
}
