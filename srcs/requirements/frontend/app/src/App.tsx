import "./App.css";

import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

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
import Notifs from "./components/Notifs.tsx";

import Api from "./utils/Api";

function Auth({setLogInfo}: {setLogInfo: Function})
{
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const api = new Api(`http://${location.hostname}:3450`);

	const navigate = useNavigate();
	const redirectPath = localStorage.getItem("auth_redirect");

	const called = useRef(false);

	useEffect(() => {
		if (called.current)
			return ;
		called.current = true;
		api
			.post("/auth", {
				"code": code,
				"redirect_uri": `http://${location.host}/auth`
			})
			.then((data: any) => {
				localStorage.setItem(
					"my_info", JSON.stringify({logged: true, token: data.access_token})
				);
				setLogInfo({logged: true, token: data.access_token});
			})
			.catch(() => {
				localStorage.removeItem("my_info")
			})
			.finally(() =>
				navigate(redirectPath ? redirectPath : "/", {replace: true})
			);
	}, []);

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
	const data = localStorage.getItem("my_info");

	const [logInfo, setLogInfo] = useState(() => {
		if (data)
			return (JSON.parse(data))
		return { logged: false, token: ""};
	});

	const [notifs, setNotifs] = useState<{type: number, content: string}[]>([]);

	function addNotif(add: {type: number, content: string}) {
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
					<Route path="/chat" element={<Chat />} />
					<Route path="/chattest/*" element={<ChatInterface />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/about" element={<About />} />
					<Route path="/sandbox" element={<Sandbox />} />
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