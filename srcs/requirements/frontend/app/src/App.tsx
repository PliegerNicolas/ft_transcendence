import "./App.css";

import { useState, useEffect, useContext, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate} from "react-router-dom";
import { useMutation, MutationFunction, useQuery} from "@tanstack/react-query";

import { MyContext } from "./utils/contexts.ts";
import { InviteType, NotifType } from "./utils/types.ts";

import { io } from 'socket.io-client';

import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";

import Home from "./components/Home.tsx";
import Play from "./components/Game/Play.tsx";
import PrivatePlay from "./components/Game/PrivatePlay.tsx";
import Chat from "./components/Chat/Chat.tsx";
import Settings from "./components/Settings.tsx";
import About from "./components/About.tsx";
import Sandbox from "./components/Sandbox.tsx";
import User from "./components/User/User.tsx";
import Notifs from "./components/Notifs.tsx";
import Invites from "./components/Game/Invitations.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import ConfirmPopup from "./components/ConfirmPopup.tsx";

import Api from "./utils/Api";
import { randomString } from "./utils/utils.ts";
import { useGet, useStopOnHttp } from "./utils/hooks.ts";
import { PopupType } from "./utils/types.ts";

import closeIcon from "./assets/close.svg";
import check from "./assets/check.svg";

export const socket = io(`https://${location.hostname}:4433/socket`);

function Auth()
{
	const params = (new URL(location.href)).searchParams;
	const code = params.get("code");

	const api = new Api(`https://${location.hostname}:4433/api`);

	const { setLogged } = useContext(MyContext);

	async function emitUserInfos() {
		const res = await api.get("/me");

		socket.emit('userInfos', res.username);
	}

	const navigate = useNavigate();
	const redirectPath = localStorage.getItem("auth_redirect");

	const guard = useRef(false);

	const [status, setStatus] = useState("pending");
	const [tfaPopup, setTfaPopup] = useState(false);
	const [tfaCode, setTfaCode] = useState("");

	const postAuth = useMutation({
		mutationFn: ((code: string) =>
			api.post("/auth", {code, redirect_uri: `https://${location.host}/auth`})) as
			MutationFunction<{isTwoFactorAuthEnabled: boolean}>,

		onSuccess: (data: {isTwoFactorAuthEnabled: boolean}) => {
			setLogged(false);
			if (data.isTwoFactorAuthEnabled)
				setTfaPopup(true);
			else {
				setStatus("success");
				setLogged(true);
				emitUserInfos();
				setTimeout(() => {
					if (document.location.pathname === "/auth")
						navigate(redirectPath ? redirectPath : "/")
				}, 1000);
			}
		},

		onError: () => {
			setStatus("error");
			setLogged(false);
		},
	});

	const tfaAuth = useMutation({
		mutationFn: ((tfaCode: string) =>
			api.post("/2fa/authenticate", {twoFactorAuthCode : tfaCode})),

		onSuccess: () => {
			setLogged(true);
			setStatus("success");
			emitUserInfos();
			setTimeout(() => navigate(redirectPath ? redirectPath : "/"), 1000);
		},

		onError: () => {
			setStatus("error");
			setLogged(false);
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
		{
			tfaPopup &&
			<ConfirmPopup
				title="Two Factor Authentication"
				text={<>
					2FA is enabled for this account. To log in, you need to open your third
					party authenticator app, and provide the code corresponding to Ft_pong.
					<br /><br />
					<div style={{textAlign: "center"}}>
						<input type="text" placeholder="2FA code" value={tfaCode}
							onChange={(ev) => setTfaCode(ev.currentTarget.value)}
						/>
					</div>
				</>}
				cancelFt={() => {
					setLogged(false);
					navigate(redirectPath ? redirectPath : "/");
				}}
				action="Done."
				actionFt={() => {tfaAuth.mutate(tfaCode); setTfaPopup(false)}}
			/>
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
	const stopOnHttp = useStopOnHttp();
	const checkLog = useQuery({
		queryKey: ["me"],
		queryFn: () => new Api(`https://${location.hostname}:4433/api`).get("/me"),
		retry: stopOnHttp,
		staleTime: 5000
	});

	const [logged, setLogged] = useState(checkLog.isSuccess);
	useEffect(() => {setLogged(checkLog.isSuccess)}, [checkLog.isSuccess]);

	const [notifs, setNotifs] = useState<NotifType[]>([]);

	function addNotif(add: NotifType) {
		add.date = Date.now();
		add.id = "" + add.date + randomString(8);
		setNotifs(prev => [...prev, add]);
	}

	const [invites, setInvites] = useState<InviteType[]>([]);

	function addInvite(add: InviteType) {
		setInvites(prev => [...prev, add]);
	}

	const [popup, setPopup] = useState<PopupType | null>(null);

	function setGlobalPopup(param: PopupType) {
		if (param)
			param.cancelFt = () => setPopup(null);
		setPopup(param);
	}

	const [lastChan, setLastChan] = useState("");

	const getUser = useGet(["me"], logged);

	useEffect(() => {
		if (getUser.isSuccess) {
			socket.emit('userInfos', getUser.data.username);
			socket.emit("rejoinChannels", getUser.data.username);
		}
	}, [logged]);

	useEffect(() => {
		if (socket) {
			socket.on('getUserInfos', () => {
				if (getUser.isSuccess) {
					//console.log("sent user infos to back");
					socket.emit('userInfos', getUser.data.username);
				}
			});
			socket.on('invitedToPrivate', (user: string, lobby: string) => {
				//console.log("invitation de : " + user);
				addInvite({from: user, lobby: lobby});
			});
		}
		return () => {
			if (socket) {
				socket.off('getUserInfos');
				socket.off('invitedToPrivate');
			}
		};
	}, []);

	return (
		<MyContext.Provider value={{
			logged,
			setLogged,
			addNotif,
			addInvite,
			api: new Api(`https://${location.hostname}:4433/api`),
			lastChan,
			setLastChan,
			setGlobalPopup,
			me: getUser.data,
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
					<Route path="/about" element={<About />} />
					<Route path="/auth" element={<Auth />} />
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
				<Invites list={invites} setList={setInvites} />
				{
					popup &&
					<ConfirmPopup
						title={popup.title}
						text={popup.text}
						action={popup.action}
						cancelFt={popup.cancelFt}
						actionFt={popup.actionFt}
					/>
				}
			</Router>
		</MyContext.Provider>
	);
}

export default App;