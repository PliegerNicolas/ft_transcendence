import "./App.css";

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

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

Here's the kind of code that will have to be implemented server-side to obtain
the 42 api token:

async function loadFtToken()
{
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
	const token_data = await response.json();
	const token = token_data.access_token;
}

*/

function Auth()
{
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	console.log("Should send this code to the backend API: " + code);

	/*
	**	HERE, SOME KIND OF BACKEND API CALL TO SEND THE AUTHENTIFICATION CODE
	**	AND OBTAIN ALL RELEVANT USER LOGIN INFORMATION IN RETURN
	**	EG:
	**
	**	fetch(`http://${location.hostname}:3450/auth`, {
	**		method: "POST",
	**		headers: {
	**			"Content-Type": "application/json"
	**		},
	**		body: JSON.stringify({
	**			"code": code,
	**			"redirect_uri": `http://${location.host}/auth`
	**		})
	**	}).then ...
	*/

	const navigate = useNavigate();
	const redirectPath = localStorage.getItem("auth_redirect");

	useEffect(() => {
		navigate(redirectPath ? redirectPath : "/", {replace: true})
	}, []);

	return (<div />);
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