import "./App.css";

import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import { MyContext } from "./utils/contexts.ts";
import { NotifType } from "./utils/types.ts";

import { io } from 'socket.io-client';

import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";

import Home from "./components/Home.tsx";
import Play from "./components/Game/Play.tsx";
import PrivatePlay from "./components/Game/PrivatePlay.tsx";
import Stats from "./components/Stats.tsx";
import Chat from "./components/Chat/Chat.tsx";
import Settings from "./components/Settings.tsx";
import About from "./components/About.tsx";
import Sandbox from "./components/Sandbox.tsx";
import User from "./components/User.tsx";
import Notifs from "./components/Notifs.tsx";
import RequireAuth from "./components/RequireAuth.tsx";

import Api from "./utils/Api";
import { randomString } from "./utils/utils.ts";

import closeIcon from "./assets/close.svg";
import check from "./assets/check.svg";

export const socket = io(`http://${location.hostname}:3450/chat`);

function Auth({setLogInfo}: {setLogInfo: Function})
{
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const api = new Api(`http://${location.hostname}:3450`);

	const navigate = useNavigate();
	const redirectPath = localStorage.getItem("auth_redirect");

	const guard = useRef(false);

	const [status, setStatus] = useState("pending");

	const postAuth = useMutation({
		mutationFn: ((code: string) =>
			api.post("/auth", {code, redirect_uri: `http://${location.host}/auth`})) as
			MutationFunction<{access_token: string}>,

		onSuccess: (data: {access_token: string}) => {
			setStatus("success");
			localStorage.setItem(
				"my_info", JSON.stringify({logged: true, token: data?.access_token}));
			setLogInfo({logged: true, token: data.access_token});
			setTimeout(() => navigate(redirectPath ? redirectPath : "/"), 1000);
		},

		onError: () => {
			setStatus("error");
			localStorage.removeItem("my_info");
		},
	});

	useEffect(() => {
		if (guard.current) return ;
		guard.current = true;

		postAuth.mutate(code);
	}, []);

	return (
		<div className="MainContent Auth">
		{
			status === "success" &&
			<h3 className="Auth__Done">
				<img src={check}/> Done!
			</h3>
			|| status === "pending" &&
			<h3>
				Please wait...
			</h3>
			|| status === "error" &&
			<div className="Auth__Fail">
				<h3 className="Auth__Done">
					<img src={closeIcon}/>
					Something went wrong:<br />{ postAuth.error?.message }
				</h3>
				<button onClick={() => navigate(redirectPath ? redirectPath : "/")}>
					Go back
				</button>
			</div>
		}
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

	const [notifs, setNotifs] = useState<NotifType[]>([]);

	function addNotif(add: NotifType) {
		add.date = Date.now();
		add.id = "" + add.date + randomString(8);
		setNotifs(prev => [...prev, add]);
	}

	const [lastChan, setLastChan] = useState("");

	return (
		<MyContext.Provider value={{
			...logInfo,
			addNotif,
			api: new Api(`http://${location.hostname}:3450`, logInfo.token),
			lastChan,
			setLastChan,
		}}>
			<Router>
				<Header/>
				<Navbar />
				<Routes>
					<Route path="/"	element={<Home />} />
					<Route path="/play" element={
						<RequireAuth elem={<Play />} />
					} />
					<Route path="/play/private" element={
						<RequireAuth elem={<PrivatePlay />} />
					} />
					<Route path="/stats" element={
						<RequireAuth elem={<Stats />} />
					} />
					<Route path="/about" element={<About />} />
					<Route path="/auth" element={<Auth setLogInfo={setLogInfo} />} />
					<Route path="/chat/*" element={
						<RequireAuth elem={<Chat />} />
					}/>
					<Route path="/settings" element={
						<RequireAuth elem={<Settings />} />
					}/>
					<Route path="/sandbox" element={
						<RequireAuth elem={<Sandbox />} />
					}/>
					<Route path="/user/:id" element={
						<RequireAuth elem={<User />} />
					} />
					<Route path="*" element={<NotFound />} />
				</Routes>
				<Notifs list={notifs} setList={setNotifs} />
			</Router>
		</MyContext.Provider>
	);
}

export default App;