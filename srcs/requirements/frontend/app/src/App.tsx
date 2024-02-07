import "./App.css";

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { MyContext } from "./utils/contexts.ts";

import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";

import Home from "./components/Home.tsx";
import Play from "./components/Game/Play.tsx";
import Stats from "./components/Stats.tsx";
import Chat from "./components/Chat.tsx";
import ChatInterface from "./components/ChatInterface.tsx";
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

	async function connect() {
		api
			.post("/auth", {
				"code": code,
				"redirect_uri": `http://${location.host}/auth`
			})
			.then((data: any) => {
				console.log("SUCCESS");
				console.log(data);
				props.setMyInfo({logged: true, token: data.access_token});
				localStorage.setItem(
					"my_info", JSON.stringify({logged: true, token: data.access_token})
				);
			})
			.catch(err => {
				console.log("FAIL");
				console.log(err);
				props.setMyInfo({logged: false, token: ""});
				localStorage.removeItem("my_info")
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
			<h2>404 Page not found :-/</h2>
			The page: "{location.pathname}" doesn't seem to exist on our site. Sorry.
		</div>
	);
}

function App()
{
	const [myInfo, setMyInfo] = useState(() => {

//		const data = localStorage.getItem("my_info");

		/*
		**	Instead of directly returning the data retrieved from the storage, we
		**	should send an API request to check if the token is still valid. That's
		**	what we're going to do when possible.
		*/

//		if (data)
//			return (JSON.parse(data));

		return ({
			logged: false,
			token: "",
		});

	});
	const api = new Api(`http://${location.hostname}:3450`);

	return (
		<MyContext.Provider value={{
			...myInfo,
			allChans: useQuery({
				queryKey: ["allChans"],
				queryFn: () => api.get("/channels")
			}),
		}}>
			<Router>
				<Header/>
				<Navbar />
				<Routes>
					<Route path="/"	element={<Home />} />
					<Route path="/play" element={<Play />} />
					<Route path="/stats" element={<Stats />} />
					<Route path="/chat" element={<Chat />} />
					<Route path="/chattest/*" element={<ChatInterface />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/about" element={<About />} />
					<Route path="/sandbox" element={<Sandbox />} />
					<Route path="/user/:id" element={<User />} />
					<Route path="/auth" element={<Auth setMyInfo={setMyInfo} />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
		</MyContext.Provider>
	);
}

export default App;