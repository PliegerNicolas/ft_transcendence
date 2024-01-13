import "./App.css";

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";

import Home from "./components/Home.tsx";
import Play from "./components/Play.tsx";
import Stats from "./components/Stats.tsx";
import Chat from "./components/Chat.tsx";
import Settings from "./components/Settings.tsx";
import About from "./components/About.tsx";
import Sandbox from "./components/Sandbox.tsx";
import User from "./components/User.tsx";

/*

All the code in Auth will have to move server side.

This is currently not secure and will probably explode and lead to disasters.

(e.g. pushing FT A.P.I. credentials ^^' )

*/

function Auth()
{
	const [tokenString, setTokenString] = useState("");
	const [me, setMe] = useState({usual_full_name: "", login: "", image: {versions: {small: ""}}});
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const client_id = "u-s4t2ud-9a9cee22edb9c564d3166746c9bf18b72bd6b36cf73c9ab06d6120c44d63c0ff";
	const client_secret = "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"; // THIS IS A BIG NONO
	const redirect_uri = `http://${location.hostname}:3030/auth`;

	async function loadFtToken() {
		if (tokenString)
			return ;

		const response = await fetch("https://api.intra.42.fr/oauth/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"grant_type": "authorization_code",
				"client_id": client_id,
				"client_secret": client_secret,
				"code": code,
				"redirect_uri": redirect_uri
			})
		});
		const token = await response.json();

		setTokenString(token.access_token);
	}

	
	async function loadMe() {
		const meResponse = await fetch("https://api.intra.42.fr/v2/me", {
			headers: {
				"Authorization": "Bearer " + tokenString,
				"Content-Type": "application/json"
			}
		});
		const melol = await meResponse.json();

		setMe(melol);
	}

	const redirectPath = localStorage.getItem("auth_redirect");

	return (
		<div className="MainContent">
			<h3>Authentification... Redirect {"---> "+ redirectPath}</h3>
			<p>
				Code: {code} <br/>
				Token: {tokenString} <br/>
				{
					me.login ?
					"You are: " + me.usual_full_name + " a.k.a. " + me.login :
					""
				}
				{
					me.login ?
					<img
						src={me.image.versions.small}
						style={{margin: "10px", display: "block", borderRadius: "7px"}}
					/> :
					""
				}
				<br/>
				<button onClick={loadFtToken}>Load token</button>
				<button onClick={loadMe}>Load me</button>
				<Link to={redirectPath !}><button>Done</button></Link>
			</p>
		</div>
	);
}

function App()
{
	return (
		<Router>
			<Header/>
			<div className="App__Content">
				<Navbar />
				<Routes>
					<Route path="/"	element={<Home />} />
					<Route path="/play" element={<Play />} />
					<Route path="/stats" element={<Stats />} />
					<Route path="/chat" element={<Chat />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/about" element={<About />} />
					<Route path="/sandbox" element={<Sandbox />} />
					<Route path="/user" element={<User />} />
					<Route path="/auth" element={<Auth />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;