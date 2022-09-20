import { Client, ServerError } from "colyseus";
import Member from "../schemas/member";
import { AuthenticatedClient, AuthOptions, BotRoom } from "./room";
import TokenHandler from "../utils/tokenHandler";
import db from "./database";
import Hyperbeam from "./hyperbeam";

export type StartSessionOptions = {
	ownerId: string;
	region: "NA" | "EU" | "AS";
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

export async function startSession(ctx: BaseContext & { options: StartSessionOptions }) {
	let hbSession: Awaited<ReturnType<typeof Hyperbeam.createSession>>;
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
		},
	});
	if (!ctx.room.ownerId) ctx.room.ownerId = ctx.options.ownerId;
	ctx.room.session = { ...session, instance: hbSession };
	ctx.room.state.embedUrl = hbSession.embedUrl;
	ctx.room.state.sessionId = hbSession.sessionId;
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

export async function setControl(ctx: AuthContext & { targetId: string; control: Member["control"] }) {
	const target = ctx.room.state.members.get(ctx.targetId);
	if (!target || target.control === ctx.control) return;
	// making conditions simpler to read
	const isSelf = target.id === ctx.client.userData.id;
	const isOwner = ctx.room.ownerId === ctx.client.userData.id;
	const hasControl = ctx.client.userData.control === "enabled";
	const isRequesting = ctx.control === "requesting" || ctx.control === "disabled";
	const isMultiplayer = ctx.room.multiplayer;
	const isPassingControl = ctx.control === "enabled" && hasControl;
	// check conditions for setting control
	if (isOwner || isPassingControl || (isSelf && (isRequesting || isMultiplayer))) {
		target.control = ctx.control;
		if (target.hbId && ctx.room.session?.instance && ctx.control !== "requesting") {
			// requesting is just a visual change, no need to update perms
			await ctx.room.session.instance.setPermissions(target.hbId, {
				control_disabled: ctx.control !== "enabled",
				control_exclusive: !isMultiplayer,
			});
		}
	}
}

export async function setMultiplayer(ctx: AuthContext & { multiplayer: boolean }) {
	if (ctx.room.ownerId !== ctx.client.userData.id) return;
	const actions: Promise<void>[] = [];
	if (!ctx.multiplayer) {
		for (const member of ctx.room.state.members.values()) {
			// dont disable control for the owner
			if (member.id === ctx.room.ownerId) continue;
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
