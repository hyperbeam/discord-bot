import { writable } from "svelte/store";
import { User, Room } from "./types";

export const currentUser = writable<User | null>(null);
export const currentRoom = writable<Room | null>(null);

export const rooms = writable<Room[]>([]);