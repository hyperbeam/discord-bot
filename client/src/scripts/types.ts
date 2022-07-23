export interface User {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string;
}

export interface Room {
	name: string;
	url: string;
	ownerId: string;
	members?: User[];
}

export interface Session {
	embedUrl: string;
	createdAt: string;
}