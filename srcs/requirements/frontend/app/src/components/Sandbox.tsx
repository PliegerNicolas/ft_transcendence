import { useContext } from "react";
import { Link } from "react-router-dom";
import { UseQueryResult, useQuery, useMutation } from "@tanstack/react-query";
import { MyContext } from "../utils/contexts.ts";
import { UserType, UserPostType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import { useInvalidate, stopOnHttp, randomString } from "../utils/utils.ts";

import close from "../assets/close.svg";

import "../styles/sandbox.css";

// <Sandbox /> =================================================================

export default function Sandbox()
{
	const context = useContext(MyContext);

	const invalidate = useInvalidate();

	const getChans = useQuery({
		queryKey: ["allChans"],
		queryFn: () => context.api.get("/channels"),
		retry: stopOnHttp,
	});

	const getUsers = useQuery({
		queryKey: ["users"],
		queryFn: () => context.api.get("/users"),
		retry: stopOnHttp,
	});
	
	const postUser = useMutation({
		mutationFn: (user: UserPostType) => context.api.post("/users", user),
		onSettled: () => invalidate(["users"]),
		onError: error => context.addNotif({content: error.message}),
	});

	const postChan = useMutation({
		mutationFn: (name: string) =>
			context.api.post("/channels", {name, visibility: "public", mode: "open"}),
		onSettled: () => invalidate(["allChans"]),
		onError: error => context.addNotif({content: error.message}),
	});

	const delChan = useMutation({
		mutationFn: (id: number) => context.api.delete("/channels/" + id),
		onSettled: () => invalidate(["allChans"]),
		onError: error => context.addNotif({content: error.message}),
	});

	const delUser = useMutation({
		mutationFn: (id: string) => context.api.delete("/users/" + id),
		onSettled: () => invalidate(["users"]),
		onError: error => context.addNotif({content: error.message}),
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
			<section>
				<h3>Global context:</h3>
				<div className="genericList Sandbox__ContextList">
					<div className="Sandbox__Item">
						<div>Logged</div>
						<div>{context.logged ? "Yes" : "No"}</div>
					</div>
					<div className="Sandbox__Item">
						<div>Token</div>
						<div>{context.token}</div>
					</div>
				</div>
				<h4>All channels:</h4>
				<button onClick={() => postChan.mutate("c_" + randomString(6))}>
					Add a chan
				</button>
				<button onClick={() => invalidate(["allChans"])}>
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