import { HyperbeamEmbed } from "@hyperbeam/web";
import { Room } from "colyseus.js";
import { writable } from "svelte/store";

import Member from "./schemas/member";
import RoomState from "./schemas/room";

export const hyperbeamEmbed = writable<HyperbeamEmbed>();
export const room = writable<Room<RoomState>>();

export const members = writable<Member[]>([]);
export const currentUser = writable<Member>();
export const trackedCursor = writable<{ x: number; y: number }>({ x: 0, y: 0 });
export const attemptSignIn = writable(false);

export type ExtendedErrorType = { title: string; description: string; code?: number };
export const extendedError = writable<ExtendedErrorType>();
