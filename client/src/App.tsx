import React from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";

import OauthHandler from "./components/OAuthHandler";
import VM from "./components/VM";

function App() {

	return (
		<div className="App">
			<h1>Hyperbeam Beta bot</h1>
			<Router>
				<Routes>
					<Route path="/authorize" element={<OauthHandler />} />
					<Route path="/rooms/:id" element={<VM />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
