import { Schema, type } from "@colyseus/schema";
import { Cursor } from "./cursor";

export class Member extends Schema {
	@type("string") id: string;
	@type("string") hbId?: string;
	@type("string") name: string;
	@type("string") avatarUrl: string;
	@type("string") color: string = "#000000";
	@type("string") control: "disabled" | "requesting" | "enabled" = "enabled";
	@type(Cursor) cursor: Cursor;
}

export default Member;
