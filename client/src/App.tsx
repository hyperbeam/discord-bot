import React from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";

import { Header } from "./components/Header/Header";
import OauthHandler from "./components/OAuthHandler";
import RoomList from "./components/RoomList/RoomList";
import VM from "./components/VM";
import { UserData } from "./scripts/auth";

function App() {
	const [user, setUser] = React.useState<UserData | null>(null);
	return (
		<Router>
			<div className="App">
				<Header user={user} setUser={setUser} />
				<Routes>
					<Route path="/" element={<RoomList />} />
					<Route path="/authorize" element={<OauthHandler user={user} setUser={setUser} />} />
					<Route path="/rooms/:id" element={<VM />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;