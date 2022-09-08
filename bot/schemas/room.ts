import { type, Schema, MapSchema } from "@colyseus/schema";
import { Member } from "./member";

export class RoomState extends Schema {
	@type({ map: Member }) members = new MapSchema<Member>();
	@type("string") embedUrl?: string;
	@type("string") sessionId?: string;
}
