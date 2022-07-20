import { VMRequestBody } from "./../hyperbeamAPI.d";
import { Prisma, PrismaClient, Room, User, Session, RoomMember } from "@prisma/client";
import HyperbeamAPI from "../utils/hyperbeamAPI";

// prisma does most of this really
// we just have to chain some calls
// having a common class makes that simpler and more type-safe i suppose

export default class Database {
	private dbClient: PrismaClient;
	private hbAPI: HyperbeamAPI;

	constructor(dbClient: PrismaClient) {
		this.dbClient = dbClient;
		this.hbAPI = new HyperbeamAPI(process.env.HB_API_KEY!, process.env.HB_API_ENV! as "testing" | "production");
	}

	async createUser(data: Prisma.UserCreateInput): Promise<User> {
		return this.dbClient.user.create({ data });
	}

	async upsertUser(data: Prisma.UserCreateInput): Promise<User> {
		return this.dbClient.user.upsert({ create: data, update: data, where: { userId: data.userId } });
	}

	async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<void> {
		await this.dbClient.user.delete({ where });
	}

	async getUser(where: Prisma.UserWhereInput): Promise<User | null> {
		return this.dbClient.user.findFirst({ where });
	}

	async createRoom(data: Prisma.RoomCreateInput): Promise<Room> {
		return this.dbClient.room.create({ data });
	}

	async deleteRoom(where: Prisma.RoomWhereUniqueInput): Promise<void> {
		await this.dbClient.room.delete({ where });
	}

	async getRoom(where: Prisma.RoomWhereInput): Promise<Room | null> {
		return this.dbClient.room.findFirst({ where });
	}

	async getRooms(where: Prisma.RoomWhereInput): Promise<Room[]> {
		return this.dbClient.room.findMany({ where });
	}

	// could get out of sync with membercount maybe?
	async joinRoom(data: Prisma.RoomMemberCreateInput): Promise<RoomMember> {
		const member = await this.dbClient.roomMember.create({ data });
		await this.dbClient.room.update({ where: { id: member.roomId }, data: { memberCount: { increment: 1 } } });
		return member;
	}

	// could get out of sync with membercount maybe?
	async leaveRoom(where: Prisma.RoomMemberWhereUniqueInput): Promise<User> {
		const member = await this.dbClient.roomMember.delete({ where, select: { user: true, roomId: true } });
		await this.dbClient.room.update({ where: { id: member.roomId }, data: { memberCount: { decrement: 1 } } });
		return member.user;
	}

	// distinct userIds = unique members
	async getRoomMembers(where: Prisma.RoomWhereInput): Promise<User[]> {
		const room = await this.getRoom(where);
		if (!room) return [];
		const users = await this.dbClient.roomMember.findMany({ select: { user: true }, where: { roomId: room.id }, distinct: "userId" });
		return users.map((u) => u.user);
	}

	async getMemberCount(where: Prisma.RoomWhereInput): Promise<number> {
		const room = await this.getRoom(where);
		if (!room) return 0;
		return this.dbClient.roomMember.count({ where: { roomId: room.id }, distinct: "userId" });
	}

	// ordering might be off here, but it works for now
	async getRoomSessions(where: Prisma.RoomWhereInput): Promise<Session[]> {
		const room = await this.getRoom(where);
		if (!room) return [];
		return this.dbClient.session.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "asc" } });
	}

	async getLatestSession(where: Prisma.RoomWhereInput): Promise<Session | null> {
		const room = await this.getRoom(where);
		if (!room) return null;
		return this.dbClient.session.findFirst({ where: { roomId: room.id }, orderBy: { createdAt: "desc" } });
	}

	// this interacts with the api, keep it here for now
	// later down the line we'll have more hyperbeam api interactions auto handled here itself
	async createHyperbeamSession(roomUrl: string, data?: VMRequestBody): Promise<Session> {
		const room = await this.getRoom({ url: roomUrl });
		if (!room) throw new Error("Room not found");
		const sessionData = await this.hbAPI.createSession(data);
		const session = await this.dbClient.session.create({
			data: {
				roomId: room.id,
				sessionId: sessionData.session_id,
				embedUrl: sessionData.embed_url,
				adminToken: sessionData.admin_token,
				terminationDate: sessionData.termination_date,
			},
		});
		return session;
	}
}