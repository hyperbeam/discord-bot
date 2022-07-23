export interface User {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string;
}

export interface Room {
	id: string;
	name: string;
	url: string;
	owner: User;
	members: User[];
}

export interface Session {
	room: Room;
	embedUrl: string;
}