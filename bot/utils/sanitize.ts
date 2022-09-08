import { User, Session } from "@prisma/client";

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
	const ret: any = {};
	keys.forEach((key: K) => {
		ret[key] = obj[key];
	});
	return ret as Pick<T, K>;
}

export const user = (data: User) => pick(data, "id", "username", "avatar", "discriminator");
export const session = (data: Session) => pick(data, "sessionId", "url", "createdAt", "endedAt", "ownerId");

export default { user, session };
