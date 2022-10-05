import { HyperbeamEmbed } from "@hyperbeam/web";
import { writable } from "svelte/store";
import { Room } from "colyseus.js";
import RoomState from "./schemas/room";
import Member from "./schemas/member";

export const hyperbeamEmbed = writable<HyperbeamEmbed>();
export const room = writable<Room<RoomState>>();

export const members = writable<Member[]>([]);
export const currentUser = writable<Member>();
export const trackedCursor = writable<{ x: number; y: number }>({ x: 0, y: 0 });
export const cursorInterval = writable<number>();
