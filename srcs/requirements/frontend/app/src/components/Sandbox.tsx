import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MutationFunction, useMutation } from "@tanstack/react-query";
import { MyContext } from "../utils/contexts.ts";
import { UserType, UserPostType, ChanSpecsType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import { httpStatus, randomString } from "../utils/utils.ts";
import { useInvalidate, useMutateError, useGet } from "../utils/hooks.ts";

import close from "../assets/close.svg";
import check from "../assets/check.svg";

import "../styles/sandbox.css";
import ConfirmPopup from "./ConfirmPopup.tsx";

// <Sandbox /> =================================================================

export default function Sandbox()
{
	const {api, logged, token, me} = useContext(MyContext);

	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const getChans = useGet(["channels"]);

	const postUser = useMutation({
		mutationFn: (user: UserPostType) => api.post("/users", user),
		onSettled: () => invalidate(["users"]),
		onError: mutateError,
	});

	const postChan = useMutation({
		mutationFn: (name: string) =>
			api.post("/channels", {name, visibility: "public", mode: "open"}),
		onSettled: () => invalidate(["channels"]),
		onError: mutateError,
	});

	const delChan = useMutation({
		mutationFn: (id: string) => api.delete("/channels/" + id),
		onSettled: () => invalidate(["channels"]),
		onError: mutateError,
	});

	function genUser() {
		const uid = "u_" + randomString(6);

		return {
			username: uid,
			email: uid + "@example.com",
			profile: {
				firstName: "Mayeul_" + uid,
				lastName: "Laneyrie_" + uid
			},
			oauthId: 100000 + Math.floor(1000000 * Math.random())
		};
	}

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current?.scrollTo(0, 0);
	}, []);

	return (
		<main className="MainContent" ref={ref}>
			<h2>Sandbox</h2>
			<section>
				<h3>Global context:</h3>
				<div className="genericList Sandbox__ContextList">
					<div className="Sandbox__Item">
						<div>Logged</div>
						<div>{logged ? "Yes" : "No"}</div>
					</div>
					<div className="Sandbox__Item">
						<div>Token</div>
						<div>{token}</div>
					</div>
				</div>
				<h4>All channels:</h4>
				<button onClick={() => postChan.mutate("c_" + randomString(6))}>
					Add a chan
				</button>
				<button onClick={() => invalidate(["channels"])}>
					Reload
				</button>
				<hr />
				{
					getChans?.isSuccess &&
					<div className="genericList">
					<div className="Sandbox__Item genericListHead">
						<div>ID</div>
						<div>NAME</div>
					</div>
					{
						getChans.data.map((chan: ChanSpecsType) =>
							<div key={chan.channel.id} className="Sandbox__Item">
								<div>{chan.channel.id}</div>
								<div>
									<Link to={"/chat/" + chan.channel.id}>
										<span>{chan.channel.name}</span>
									</Link>
								</div>
								<div>
									<button
										className="deleteChan"
										onClick={() => delChan.mutate(chan.channel.id)}
									>
										<img src={close} alt="delete"/>
									</button>
								</div>
							</div>
						)
					}
					</div>
				}
			</section>
			<section>
				<h3>User list:</h3>
				<div>
					<button
						disabled={!me}
						onClick={() => postUser.mutate(genUser())}
					>
						Add a user
					</button>
					<button onClick={() => invalidate(["users"])}>
						Reload
					</button>
				</div>
				<hr />
				<UserListRender />
			</section>
			<Setup2fa reference={ref} />
		</main>
	);
}

// <Setup2fa /> ================================================================

function Setup2fa({reference}: {reference: React.RefObject<HTMLDivElement>})
{
	const { api, addNotif, me } = useContext(MyContext);

	const mutateError = useMutateError();

	const generate2fa = useMutation({
		mutationFn: () => api.post("/2fa/generate", {}),
		onError: mutateError,
	});

	const turnOn2fa = useMutation({
		mutationFn: (code: string) =>
			api.post("/2fa/turn-on", {twoFactorAuthCode : code}),
		onError: (error) => {
			if (httpStatus(error) === 403)
				addNotif({type: 1, content: "Failed to enable 2FA, is the code correct?"});
			else
				mutateError(error);
		},
		onSuccess: (data: {access_token: string}) => {
			setPopup(false);
			localStorage.setItem(
				"my_info", JSON.stringify({logged: true, token: data.access_token}));
			window.location.reload();
		},
	});

	const [code, setCode] = useState("");
	const [popup, setPopup] = useState(false);

	if (!me) return (
		<section>
			<h3>Setup 2fa</h3>
			<div className="notice-msg">Waiting for your user data...</div>
			<Spinner />
		</section>
	);

	return (
		<>
		<section>
			<h3>Setup 2FA</h3>
			{
				me.isTwoFactorAuthEnabled ?
				<>
					<div className="Setup2fa__Status">
						<>2FA is enabled for your account</> <img src={check} />
					</div>
					<button onClick={() => addNotif({type: 1, content: "This does nothing (yet)."})}>
						Disable 2FA?
					</button>
				</> :
				<>
					<div className="Setup2fa__Info notice-msg">
						Two-factor authentication (2FA) allows you to enforce a double layer
						of protection when logging in to this website. When connecting, a
						code will be requested from a third-party app to confirm your
						identity.<br /><br />
						To setup 2FA, you will need to flash a QR code using an
						authentication app such as Google Authenticator or Authy. You will
						then have to input the provided code to confirm your anthenticator
						app.
					</div>
					<div style={{textAlign: "center"}}>
						<button onClick={() => generate2fa.mutate()}>
							Generate QR code
						</button>
						{
							generate2fa.isSuccess &&
							<div>
								<div style={{textAlign: "center", marginTop: "10px"}}>
									<img style={{borderRadius: "18px"}} src={generate2fa.data} />
								</div>
								<form onSubmit={e => {e.preventDefault(); reference.current?.scrollTo(0, 0); setPopup(true)}}>
								<input
									type="text"
									placeholder="xxx xxx"
									value={code}
									style={{textAlign: "center", width: "6em"}}
									onChange={(ev) => {setCode(ev.currentTarget.value)}}
								/>
								</form>
							</div>
						}
					</div>
				</>
			}
		</section>
		{
			popup &&
			<ConfirmPopup
				title="Confirmation"
				text={<>Are you sure you want to enable 2FA on your account?<br /><br />
					You will need your authentication application to be available whenever
					you'll want to log in.
				</>}
				cancelFt={() => setPopup(false)}
				action="Enable"
				actionFt={() => turnOn2fa.mutate(code)}
			/>
		}
		</>
	);
}

// <UserListRender /> ==========================================================

function UserListRender()
{
	const { me, api } = useContext(MyContext);

	const mutateError = useMutateError();

	const query = useGet(["users"]);

	const setMe = useMutation({
		mutationFn: ((name: string) =>
			api.post("/auth/log_as/" + name, {})) as unknown as
			MutationFunction<{ access_token: string; }, unknown>,
		onSuccess: (data: {access_token: string}) => {
			localStorage.setItem(
				"my_info", JSON.stringify({logged: true, token: data.access_token}));
			window.location.reload();
		},
		onError: mutateError,
	});

	if (query.isPending || !me) return (
		query.isPending &&
		<div className="genericList">
			<div><Spinner /></div>
		</div>
	);

	if (query.isError) return (
		<div>
			<span className="error-msg">
				Failed to load user list: {query.error?.message}
			</span><br />
		</div>
	);

	return (
		<div className="Sandbox__Scrollable">
			<div className="genericList">
			<div className="Sandbox__Item genericListHead">
				<div>ID</div>
				<div>USERNAME</div>
			</div>
			{
				!query.data?.length ?
				<div><div>No user...</div></div> :
				query.data?.map((user: UserType) =>
					<div key={user.id} className="Sandbox__Item">
						<div>{user.id}</div>
						<div>
							<Link to={"/user/" + user.username}>
								<span>{user.username}</span>
							</Link>
						</div>
						<div>
						{
							me.id !== user.id ?
							<button className="logAs" onClick={() => setMe.mutate(user.username)}>
								Log as
							</button>:
							<div className="notice-msg" style={{marginRight: "12px"}}>(You)</div>
						}
						</div>
					</div>
				)
			}
			</div>
		</div>
	);
}