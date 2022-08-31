import { Room, User, Session } from "@prisma/client";

export type PublicRoom = {
	[K in keyof Pick<Room, "name" | "url" | "ownerId" | "createdAt" | "memberCount">]: Room[K];
};

export type PublicUser = {
	[K in keyof Pick<User, "id" | "username" | "discriminator" | "avatar" | "email">]: User[K];
};

export type PublicSession = {
	[K in keyof Pick<Session, "sessionId" | "embedUrl" | "createdAt">]: Session[K];
};

type ConnectedMember = {
	id?: string;
	socketId: string;
	hbUserId: string;
};

export interface ServerToClientEvents {
	joinSuccess: (
		data: PublicRoom & { connected: ConnectedMember[] } & {
			session: PublicSession;
		},
	) => void;
	joinFailure: (error: string) => void;
	roomMembersUpdate: (data: ConnectedMember[]) => void;
	controlTransfer: (data: ConnectedMember) => void;
}

export interface ClientToServerEvents {
	join: (data: { token: string; hbUserId: string }) => void;
	requestControl: () => void;
	releaseControl: () => void;
}
