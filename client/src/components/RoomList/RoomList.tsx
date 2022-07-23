import "./RoomList.css";

import React, { useEffect, useState } from "react";

import { apiRequest, isLoggedIn } from "../../scripts/auth";

interface Room {
	name: string;
	url: string;
	ownerId: string;
}

interface RoomListResponse {
	ownedRooms: Room[];
	memberRooms: Room[];
}

interface RoomListState extends RoomListResponse {
	loaded: boolean;
}

async function getRooms() {
	return apiRequest<RoomListResponse>("/rooms");
}

// this renders at root for now, but should be moved to /rooms
export default function RoomList() {
	if (!isLoggedIn()) return <div className="room-list">Login to view your rooms.</div>;
	const [rooms, setRooms] = useState<RoomListState>({ ownedRooms: [], memberRooms: [], loaded: false });
	useEffect(() => {
		if (!rooms.loaded)
			getRooms().then(data => setRooms({ ...data, loaded: true }));
	});
	return <div className="room-list">
		<h3>Rooms</h3>
		{!!rooms.ownedRooms.length && <div>
			<h4>Owned rooms</h4>
			<ul>
				{rooms.ownedRooms.map(r => <li key={r.url}>
					<a href={`${r.url}`}>{r.name}</a>
				</li>)}
			</ul>
		</div>}
		{!!rooms.memberRooms.length && <div>
			<h4>Member rooms</h4>
			<ul>
				{rooms.memberRooms.map(r => <li key={r.url}>
					<a href={`${r.url}`}>{r.name}</a>
				</li>)}
			</ul>
		</div>}
	</div>;
}