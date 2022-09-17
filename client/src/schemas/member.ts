import { Schema, type } from "@colyseus/schema";
import { Cursor } from "./cursor";

export class Member extends Schema {
	@type("string") id: string;
	@type("string") hbId?: string;
	@type("string") name: string;
	@type("string") avatarUrl: string;
	@type("string") color: string = "#000000";
	@type("boolean") hasControl: boolean = true;
	@type("boolean") isAdmin: boolean = false;
	@type(Cursor) cursor: Cursor;
}

export default Member;
