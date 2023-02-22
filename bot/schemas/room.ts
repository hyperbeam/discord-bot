import { MapSchema, Schema, type } from "@colyseus/schema";

import { Member } from "./member";

export class RoomState extends Schema {
	@type({ map: Member }) members = new MapSchema<Member>();
	@type("string") embedUrl?: string;
	@type("string") sessionId?: string;
	@type("string") ownerId: string;
	@type("boolean") isPasswordProtected: boolean = false;
	// Not synced
	password?: string;
}

export default RoomState;
