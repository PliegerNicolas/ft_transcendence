import "./App.css";

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function Auth()
{
	const [tokenString, setTokenString] = useState("");
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const client_id = "u-s4t2ud-6a30fe66352f0b35cfb0b9450bd1d47869dbcbe39ecb4f8fe01a3a95cb633809";
	const client_secret = "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";
	const redirect_uri = `http://${location.hostname}:3030/auth`;

	async function loadFtToken() {
		if (tokenString)
			return ;

		const response = await fetch("https://api.intra.42.fr/oauth/token", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"grant_type": "client_credentials",
				"client_id": client_id,
				"client_secret": client_secret,
				"code": code,
				"redirect_uri": redirect_uri
			})
		});
		const token = await response.json();

		setTokenString(token.access_token);

		console.log(token);
	}

	async function loadMe() {
		const meResponse = await fetch("https://api.intra.42.fr/v2/me", {
			headers: {
				"Authorization": "Bearer " + tokenString,
				'Content-Type': 'application/json'
			}
		});
		const me = await meResponse.json();
		console.log(me);
	}

	return (
		<div className="MainContent">
			<h3>Authentification...</h3>
			<p>
				Code: {code} <br/>
				Token: {tokenString} <br/>
				<br/>
				<button onClick={loadFtToken}>Load token</button>
				<button onClick={loadMe}>Load me</button></p>
		</div>
	);
}

function App()
{
	return (
		<Router>
			<Header />
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

/*
async function loadTokenAndMe() {
	const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			"grant_type": "client_credentials",
			"client_id": /* client_id *,
			"client_secret": /* client_secret *,
			"code": /* code *,
			"redirect_uri": /* redirect_uri *
		})
	});

	const token = await tokenResponse.json();

	const meResponse = await fetch("https://api.intra.42.fr/v2/me", {
		headers: {
			"Authorization": "Bearer " + token.access_token,
			'Content-Type': 'application/json'
		}
	});

	const me = await meResponse.json();

	console.log(me);
}
*/