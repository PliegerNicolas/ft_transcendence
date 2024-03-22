import { useContext } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { MyContext } from "../utils/contexts.ts";
import { UserType, UserPostType, ChanSpecsType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import { randomString } from "../utils/utils.ts";
import { useInvalidate, useMutateError, useGet, useSetMe } from "../utils/hooks.ts";

import close from "../assets/close.svg";

import "../styles/sandbox.css";

// <Sandbox /> =================================================================

export default function Sandbox()
{
	const {api, me} = useContext(MyContext);

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

	if (me?.globalServerPrivileges !== "operator") return (
		<div className="MainContent">
			<h2>Stop Right There, Criminal Scum!</h2>
			<section>
				This page is reserved to global server operators.<br />
				Regular users may not access it.
			</section>
		</div>
	);

	return (
		<main className="MainContent">
			<h2>Sandbox</h2>
			<section>
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
		</main>
	);
}

// <UserListRender /> ==========================================================

function UserListRender()
{
	const { me } = useContext(MyContext);

	const getUsers = useGet(["users"]);
	const setMe = useSetMe();

	if (getUsers.isPending || !me) return (
		getUsers.isPending &&
		<div className="genericList">
			<div><Spinner /></div>
		</div>
	);

	if (getUsers.isError) return (
		<div>
			<span className="error-msg">
				Failed to load user list: {getUsers.error?.message}
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
				!getUsers.data?.length ?
				<div><div>No user...</div></div> :
				getUsers.data
					?.sort((a: UserType, b: UserType) => +a.id - +b.id)
					.map((user: UserType) =>
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
							<button className="logAs" onClick={() => setMe(user.username)}>
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