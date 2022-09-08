import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export class TokenHandler {
	static generate(id: string, hash: string): string {
		return jwt.sign({ id }, hash);
	}

	static verify(token: string): false | { id: string; verify: (user: User) => boolean } {
		const decoded = jwt.decode(token) as { id: string };
		if (
			typeof decoded !== "object" ||
			!decoded ||
			!Object.keys(decoded).includes("id") ||
			typeof decoded.id !== "string"
		)
			return false;
		return {
			id: decoded?.id,
			verify: (user: User) => user.id === decoded.id && !!user.hash && !!jwt.verify(token, user.hash),
		};
	}
}

export default TokenHandler;
