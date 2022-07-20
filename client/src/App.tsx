import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { Header } from "./components/Header/Header";
import OauthHandler from "./components/OAuthHandler";
import RoomList from "./components/RoomList/RoomList";
import VM from "./components/VM";
import { UserData } from "./scripts/auth";

// TODO: get sockets working
function socketHandler() {
	const socket = io(import.meta.env.VITE_API_SERVER_BASE_URL);
	socket.on("connect", () => {
		console.log("Connected to server");
	});
	return socket;
}

// global user state
interface AppState {
	user?: UserData;
	socket?: Socket;
	loaded: boolean;
}


function App() {
	const [state, setState] = React.useState<AppState>({ loaded: false });
	const setUser = (user?: UserData) => { setState({ ...state, user }); };
	useEffect(() => {
		if (!state.loaded) {
			const socket = socketHandler();
			socket.on("connect", () => {
				setState({ ...state, loaded: true, socket });
				console.log("Connected to server");
			});
		}
	});
	return (
		<Router>
			<div className="App">
				<Header user={state.user} setUser={setUser} />
				<Routes>
					<Route path="/" element={<RoomList />} />
					<Route path="/authorize" element={<OauthHandler user={state.user} setUser={setUser} />} />
					<Route path="/rooms/:id" element={<VM />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;