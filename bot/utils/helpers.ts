import { Room, Session, User } from "@prisma/client";
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
	const ret: any = {};
	keys.forEach(key => {
		ret[key] = obj[key];
	});
	return ret;
}

const publicProperties = {
	room: ["name", "url", "ownerId", "createdAt", "memberCount"] as Array<keyof Room>,
	user: ["id", "username", "discriminator", "avatar", "email"] as Array<keyof User>,
	session: ["embedUrl", "createdAt"] as Array<keyof Session>
};

export const publicObject = {
	room: (r: Room) => pick(r, ...publicProperties.room),
	user: (u: User) => pick(u, ...publicProperties.user),
	session: (s: Session) => pick(s, ...publicProperties.session),
};