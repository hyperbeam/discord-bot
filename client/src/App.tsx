import {
	BrowserRouter as Router,
	Routes,
	Route
} from "react-router-dom";
import OauthHandler from "./components/OAuthHandler";

function App() {

	return (
		<div className="App">
			<h1>Hyperbeam Beta bot</h1>
			<Router>
				<Routes>
					<Route path="/authorize" element={<OauthHandler />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
