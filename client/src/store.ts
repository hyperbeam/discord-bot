import { HyperbeamEmbed } from "@hyperbeam/web";
import { writable } from "svelte/store";
import { Room } from "colyseus.js";
import RoomState from "./schemas/room";

export const hyperbeamEmbed = writable<HyperbeamEmbed>();
export const room = writable<Room<RoomState>>();
export const roomState = writable<RoomState>();
