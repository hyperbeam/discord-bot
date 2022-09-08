import { writable } from "svelte/store";
import { User, Room } from "./types";
import { HyperbeamIFrame } from "@hyperbeam/web";

export const currentUser = writable<User>();
export const currentRoom = writable<Room>();

export const rooms = writable<Room[]>();
export const hbSession = writable<HyperbeamIFrame>();
