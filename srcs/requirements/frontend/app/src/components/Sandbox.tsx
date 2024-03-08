import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { MyContext } from "../utils/contexts.ts";
import { UserType, UserPostType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import { randomString } from "../utils/utils.ts";
import { useInvalidate, useMutateError, useGet } from "../utils/hooks.ts";

import close from "../assets/close.svg";
import check from "../assets/check.svg";

import "../styles/sandbox.css";

// <Sandbox /> =================================================================

export default function Sandbox()
{
	const {api, logged, token} = useContext(MyContext);

	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const getChans = useGet(["channels"]);
	const getUsers = useGet(["users"]);

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
		mutationFn: (id: number) => api.delete("/channels/" + id),
		onSettled: () => invalidate(["channels"]),
		onError: mutateError,
	});

	const delUser = useMutation({
		mutationFn: (id: string) => api.delete("/users/" + id),
		onSettled: () => invalidate(["users"]),
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

	return (
		<main className="MainContent">
			<h2>Sandbox</h2>
			<Setup2fa />
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
						getChans.data.map((chan: {id: number, name: string}) =>
							<div key={chan.id} className="Sandbox__Item">
								<div>{chan.id}</div>
								<div>
									<Link to={"/chat/" + chan.id}>
										<span>{chan.name}</span>
									</Link>
								</div>
								<div>
									<button className="deleteChan" onClick={() => delChan.mutate(chan.id)}>
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
						disabled={!getUsers.isSuccess}
						onClick={() => postUser.mutate(genUser())}
					>
						Add a user
					</button>
					<button onClick={() => invalidate(["users"])}>
						Reload
					</button>
				</div>
				<hr />
				<UserListRender query={getUsers} del={delUser.mutate} />
			</section>
		</main>
	);
}

// <Setup2fa /> ================================================================

function Setup2fa()
{
	const {api} = useContext(MyContext);

	const mutateError = useMutateError();
	const invalidate = useInvalidate();

	const getMe = useGet(["me"]);

	const generate2fa = useMutation({
		mutationFn: () => api.post("/2fa/generate", {}),
		onError: mutateError,
	});

	const turnOn2fa = useMutation({
		mutationFn: (code: string) =>
			api.post("/2fa/turn-on", {twoFactorAuthCode : code}),
		onError: mutateError,
		onSuccess: () => invalidate(["me"]),
	});

	const [code, setCode] = useState("");

	if (getMe.isPending) return (
		<section>
			<h3>Setup 2fa</h3>
			<div className="p-style"><Spinner /></div>
		</section>
	);

	if (getMe.isError) return (
		<section>
			<span className="error-msg">
				Failed to load your personnal informations: {getMe.error.message}
			</span>
		</section>
	);

	return (
		<section>
			<h3>Setup 2FA</h3>
			{
				getMe.data.isTwoFactorAuthEnabled && false ?
				<>
					<div className="Setup2fa__Status">
						2FA is enabled for your account <img src={check} />
					</div>
					<button>
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
								<form onSubmit={e => {e.preventDefault(); turnOn2fa.mutate(code)}}>
								<input
									type="text"
									placeholder="xxx xxx"
									value={code}
									style={{textAlign: "center", width: "6em"}}
									onChange={(ev) => {setCode(ev.currentTarget.value)}}
								/>
								</form>
							</div>
							||
							<div style={{margin: "0", padding: "0"}}>
								<Spinner />
							</div>
						}
					</div>
				</>
			}
		</section>
	);
}

// <UserListRender /> ==========================================================

function UserListRender(
	{query, del}: {query: UseQueryResult<any, Error>, del: Function}
)
{
	if (query.isPending) return (
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
							<button className="deleteChan" onClick={() => del(user.username)}>
								<img src={close} alt="delete"/>
							</button>
						</div>
					</div>
				)
			}
			</div>
		</div>
	);
}