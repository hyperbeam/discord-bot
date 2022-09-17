import { HyperbeamEmbed } from "@hyperbeam/web";
import { writable } from "svelte/store";
import { Room, User } from "./types";

export const currentUser = writable<User | null>(null);
export const currentRoom = writable<Room | null>(null);
export const hb = writable<HyperbeamEmbed | null>(null);

export const rooms = writable<Room[]>();
export const hbSession = writable<HyperbeamEmbed>();
