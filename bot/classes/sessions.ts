import { Session, User } from "@prisma/client";
import { Client, matchMaker, ServerError } from "colyseus";

import Cursor from "../schemas/cursor";
import Member from "../schemas/member";
import color, { swatches } from "../utils/color";
import TokenHandler from "../utils/tokenHandler";
import db from "./database";
import Hyperbeam, { HyperbeamSession, VMRequestBody } from "./hyperbeam";
import { AuthenticatedClient, AuthOptions, BotRoom } from "./room";

export type StartSessionOptions = VMRequestBody & {
	url?: string;
	ownerId: string;
	existingSession?: BotRoom["session"] & { members?: User[] };
	password?: string;
};

type BaseContext = { room: BotRoom };
type AuthContext = BaseContext & { client: AuthenticatedClient };

export async function createSession(options: StartSessionOptions): Promise<Session> {
	let url: string = "";
	try {
		const roomData = await matchMaker.createRoom("room", options);
		url = roomData.roomId;
		return db.session.findUniqueOrThrow({ where: { url } });
	} catch (error) {
		if (url) await db.session.delete({ where: { url } }).catch(() => {});
		throw new Error(`Failed to create session: ${error}`);
	}
}

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
	let hbSession: HyperbeamSession | undefined = undefined;
	const existingSession = ctx.options.existingSession;
	if (existingSession && existingSession.sessionId && existingSession.embedUrl) {
		ctx.room.session = existingSession;
		ctx.room.state.embedUrl = existingSession.embedUrl;
		ctx.room.state.sessionId = existingSession.sessionId;
		if (!existingSession.instance) {
			try {
				const instance = await Hyperbeam.getSession(existingSession.sessionId);
				if (instance.isTerminated) {
					await endSession(existingSession.sessionId, instance.terminationDate);
					throw new ServerError(500, "Session is terminated");
				}
				ctx.room.session.instance = instance;
			} catch (error) {
				console.error(`Failed to get session instance: ${error}`);
				throw new ServerError(500, "Failed to get session instance");
			}
		}
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
		// users should automatically reconnect, so we don't need to do anything else
		return;
	} else {
		try {
			hbSession = await Hyperbeam.createSession(ctx.options);
		} catch (e) {
			console.error(e);
			throw new ServerError(500, "Could not create session");
		}
		if (hbSession && !hbSession.isTerminated) {
			const session = await db.session.create({
				data: {
					embedUrl: hbSession.embedUrl,
					sessionId: hbSession.sessionId,
					adminToken: hbSession.adminToken,
					ownerId: ctx.options.ownerId,
					password: ctx.options.password,
					createdAt: new Date(),
					url: ctx.room.roomId,
					region: ctx.options.region,
				},
			});
			if (!ctx.room.state.ownerId) ctx.room.state.ownerId = ctx.options.ownerId;
			ctx.room.session = { ...session, instance: hbSession };
			ctx.room.state.embedUrl = hbSession.embedUrl;
			ctx.room.state.sessionId = hbSession.sessionId;
		} else {
			throw new ServerError(500, "Could not create session");
		}
	}
}

export async function joinSession(ctx: AuthContext) {
	if (!ctx.room.session) throw new ServerError(500, "Session does not exist");
	if (!ctx.room.session.instance) {
		const instance = await Hyperbeam.getSession(ctx.room.session.sessionId);
		if (!instance) throw new ServerError(500, "Session does not exist");
		ctx.room.session.instance = instance;
	}
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
	await endSession(ctx.room.session.sessionId);
}

export async function getActiveSessions(ownerId?: string): Promise<(Session & { members: User[] })[]> {
	return ownerId
		? db.session.findMany({ where: { ownerId, endedAt: { equals: null } }, include: { members: true } })
		: db.session.findMany({ where: { endedAt: { equals: null } }, include: { members: true } });
}

export async function endAllSessions(ownerId?: string): Promise<(Session & { members: User[] })[]> {
	const sessions = await getActiveSessions(ownerId);
	for (let i = 0; i < sessions.length; i++) {
		try {
			const session = sessions[i];
			const endedSession = await endSession(session.sessionId);
			if (endedSession) sessions[i] = endedSession;
			await Hyperbeam.deleteSession(session.sessionId).catch(() => {});
			await matchMaker.remoteRoomCall(session.url, "disconnect").catch(() => {});
		} catch {
			continue;
		}
	}
	return sessions;
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
	const isAlreadyEnabled = target.control === "enabled";
	// check conditions for setting control
	if (!target.hbId) {
		console.log(`Hyperbeam user ID not connected to target member ${target.id} (${target.name}).`);
		return;
	}
	if (!ctx.room.session?.instance) {
		console.log("Hyperbeam session not initialized.");
		if (ctx.room.session?.sessionId) {
			try {
				ctx.room.session.instance = await Hyperbeam.getSession(ctx.room.session.sessionId);
			} catch {
				console.log("Hyperbeam session not found.");
			}
		}
		return;
	}
	if (isAlreadyEnabled && ctx.control === "requesting") return; // already enabled, no need to request again
	if (isOwner) {
		await ctx.room.session.instance.setPermissions(target.hbId, { control_disabled: ctx.control !== "enabled" });
		target.control = ctx.control === "disabled" ? "disabled" : "enabled";
	} else if ((isSelf && isNotEnabling) || ctx.client.userData.id === ctx.room.state.ownerId) {
		await ctx.room.session.instance.setPermissions(target.hbId, { control_disabled: ctx.control !== "enabled" });
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

export async function endSession(sessionId: string, endedAt = new Date()) {
	try {
		return db.session.update({ where: { sessionId }, data: { endedAt }, include: { members: true } });
	} catch {}
}

export async function restartActiveSessions(): Promise<Session[]> {
	const sessions = await db.session.findMany({
		where: { endedAt: { equals: null } },
		include: { members: true },
	});
	const restartedSessions: Session[] = [];
	return Promise.allSettled(
		sessions
			.map(async (session) => {
				const room = matchMaker.getRoomById(session.url);
				if (!room) {
					try {
						await matchMaker
							.createRoom("room", {
								url: session.url,
								ownerId: session.ownerId,
								region: session.region,
								existingSession: session,
								password: session.password,
							} as StartSessionOptions)
							.then(() => restartedSessions.push(session))
							.catch(() => {});
					} catch (e) {
						console.error("Failed to create room", e);
						await endSession(session.sessionId);
						return;
					}
				}
			})
			.filter((p) => !!p),
	).then(() => restartedSessions);
}
