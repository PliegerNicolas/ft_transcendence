import "./App.css";

import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import { MyContext } from "./utils/contexts.ts";

import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";

import Home from "./components/Home.tsx";
import Play from "./components/Game/Play.tsx";
import Stats from "./components/Stats.tsx";
import Chat from "./components/Chat.tsx";
import ChatTest from "./components/Chat/Chat.tsx";
import Settings from "./components/Settings.tsx";
import About from "./components/About.tsx";
import Sandbox from "./components/Sandbox.tsx";
import User from "./components/User.tsx";
import Notifs from "./components/Notifs.tsx";
import RequireAuth from "./components/RequireAuth.tsx";

import Api from "./utils/Api";

function Auth({setLogInfo}: {setLogInfo: Function})
{
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const api = new Api(`http://${location.hostname}:3450`);

	const navigate = useNavigate();
	const redirectPath = localStorage.getItem("auth_redirect");

	const guard = useRef(false);

	const postAuth = useMutation({

		mutationFn: ((code: string) =>
			api.post("/auth", {code, redirect_uri: `http://${location.host}/auth`})) as
			MutationFunction<{access_token: string}>,

		onSuccess: (data: {access_token: string}) => {
				localStorage.setItem(
					"my_info", JSON.stringify({logged: true, token: data?.access_token}));
				setLogInfo({logged: true, token: data.access_token});
			},

		onError: () => localStorage.removeItem("my_info"),

		onSettled: () => navigate(redirectPath ? redirectPath : "/")
	});

	useEffect(() => {
		if (guard.current) return ;
		guard.current = true;

		postAuth.mutate(code);
	}, []);

	return (
		<div className="MainContent">
			<h3>
				Please wait...
			</h3>
		</div>
	);
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
	const data = localStorage.getItem("my_info");

	const [logInfo, setLogInfo] = useState(() => {
		if (data)
			return (JSON.parse(data))
		return { logged: false, token: ""};
	});

	const [notifs, setNotifs] = useState<{type: number, content: string, date: number}[]>([]);

	function addNotif(add: {type: number, content: string, date: number}) {
		add.date = Date.now();
		setNotifs(prev => [...prev, add]);
	}

	return (
		<MyContext.Provider value={{
			...logInfo,
			addNotif,
			api: new Api(`http://${location.hostname}:3450`, logInfo.token)
		}}>
			<Router>
				<Header/>
				<Navbar />
				<Routes>
					<Route path="/"	element={<Home />} />
					<Route path="/play" element={<Play />} />
					<Route path="/stats" element={<Stats />} />
					<Route path="/chat" element={
						<RequireAuth elem={<Chat />} />
					}/>
					<Route path="/chattest/*" element={
						<RequireAuth elem={<ChatTest />} />
					}/>
					<Route path="/settings" element={<Settings />} />
					<Route path="/about" element={<About />} />
					<Route path="/sandbox" element={
						<RequireAuth elem={<Sandbox />} />
					}/>
					<Route path="/user/:id" element={<User />} />
					<Route path="/auth" element={<Auth setLogInfo={setLogInfo} />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
				<Notifs list={notifs} setList={setNotifs} />
			</Router>
		</MyContext.Provider>
	);
}

export default App;