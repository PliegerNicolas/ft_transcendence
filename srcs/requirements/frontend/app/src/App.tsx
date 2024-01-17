import "./App.css";

import { useEffect, useState } from "react";
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

import Api from "./utils/Api";

function Auth(props: {setMyInfo: Function})
{
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const api = new Api(`http://${location.hostname}:3450`);

	const navigate = useNavigate();
	const redirectPath = localStorage.getItem("auth_redirect");

	console.log("Should send this code to the backend API: " + code);

	async function connect() {
		api
			.post("/auth", {
				"code": code, "redirect_uri": `http://${location.host}/auth`
			})
			.then((data: any) => {
				props.setMyInfo({logged: true, token: data.access_token});
				localStorage.setItem(
					"my_info", JSON.stringify({logged: true, token: data.access_token})
				);
			})
			.catch(err => {
				console.log(err);
				props.setMyInfo({logged: false, token: ""});
				localStorage.removeItemItem("my_info")
			})
			.finally(() =>
				navigate(redirectPath ? redirectPath : "/", {replace: true})
			);
	};
	useEffect(() => {connect()}, []);

	return (<div />);
}

function NotFound()
{
	return (
		<div className="MainContent">
			<h2>Page not found :-/</h2>
			The page: "{location.pathname}" doesn't seem to exist on our site. Sorry.
		</div>
	);
}

function App()
{
	const [myInfo, setMyInfo] = useState({
		logged: false,
		token: "",
	});

	useEffect(() => {
		const data = localStorage.getItem("my_info");
		data && setMyInfo(JSON.parse(data));
	}, []);

	return (
		<Router>
			<Header myInfo={myInfo}/>
			<Navbar />
			<Routes>
				<Route path="/"	element={<Home />} />
				<Route path="/play" element={<Play />} />
				<Route path="/stats" element={<Stats />} />
				<Route path="/chat" element={<Chat />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/about" element={<About />} />
				<Route path="/sandbox" element={<Sandbox />} />
				<Route path="/user/:id" element={<User />} />
				<Route path="/auth" element={<Auth setMyInfo={setMyInfo} />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;