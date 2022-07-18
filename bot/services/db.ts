import { VMRequestBody } from "./../hyperbeamAPI.d";
import { Prisma, PrismaClient, Room, User, Session } from "@prisma/client";
import HyperbeamAPI from "../utils/hyperbeamAPI";

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

	async getRoomSessions(where: Prisma.RoomWhereInput): Promise<Session[]> {
		const room = await this.getRoom(where);
		if (!room) return [];
		return this.dbClient.session.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "asc" } });
	}

	async getLatestSession(where: Prisma.RoomWhereInput): Promise<Session | null> {
		const room = await this.getRoom(where);
		if (!room) return null;
		const sessions = await this.getRoomSessions(where);
		if (sessions.length === 0) return null;
		return sessions[sessions.length - 1];
	}

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