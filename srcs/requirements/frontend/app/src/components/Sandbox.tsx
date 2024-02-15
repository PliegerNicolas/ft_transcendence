import { useContext } from "react";
import { Link } from "react-router-dom";
import { UseQueryResult, useQuery, useMutation } from "@tanstack/react-query";
import { MyContext } from "../utils/contexts.ts";
import { UserType, UserPostType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import { useInvalidate, stopOnHttp } from "../utils/utils.ts";

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
			context.api.post("/channels", {name, status: "public"}),
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

	function random_id() {
		return (Math.random().toString().slice(-10, -1));
	}

	function genUser() {
		const uid = random_id();

		return {
			username: uid,
			email: uid + "@example.com",
			profile: {
				firstName: "Mayeul_" + uid,
				lastName: "Laneyrie_" + uid
			},
			oauthId: uid
		};
	}

	return (
		<main className="MainContent">
			<h2>Sandbox</h2>
			<section>
				<h3>Global context:</h3>
				<div className="genericList Sandbox__ContextList">
					<div className="Sandbox__ContextItem">
						<div>Logged</div>
						<div>{context.logged ? "Yes" : "No"}</div>
					</div>
					<div className="Sandbox__ContextItem">
						<div>Token</div>
						<div>{context.token}</div>
					</div>
				</div>
				<h4>All channels:</h4>
				<button onClick={() => postChan.mutate(random_id())}>
					Add new chan
				</button>
				<hr />
				{
					getChans?.isSuccess &&
					<div className="genericList">
					<div className="Sandbox__ContextItem genericListHead">
						<div>ID</div>
						<div>NAME</div>
					</div>
					{
						getChans.data.map((chan: {id: number, name: string}) =>
							<div key={chan.id} className="Sandbox__ContextItem">
								<div>#{chan.id}</div>
								<div>
									<Link to={"/chattest/" + chan.id}>
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
					<button
						disabled={!getUsers.isSuccess || !getUsers.data.length}
						onClick={() => delUser.mutate(getUsers.data.pop().id)}
					>
						Delete a user
					</button>
					<button onClick={() => invalidate(["users"])}>
						Reload
					</button>
				</div>
				<hr />
				<UserListRender query={getUsers}/>
			</section>
		</main>
	);
}

// <UserListRender /> ==========================================================

function UserListRender(
	{query}: {query: UseQueryResult<any, Error>}
)
{
	return (
		query.isPending &&
		<div className="genericList">
			<div><Spinner /></div>
		</div> ||

		query.isError &&
		<div>
			<span className="error-msg">
				Failed to load user list: {query.error?.message}
			</span><br />
		</div> ||

		query.isSuccess &&
		<div className="Sandbox__Scrollable">
			<div className="genericList">
			<div className="Sandbox__UserItem genericListHead">
				<div>ID</div>
				<div>USERNAME</div>
				<div>MAIL</div>
			</div>
			{
				!query.data?.length ?
				<div><div>No user...</div></div> :
				query.data?.map((user: UserType) =>
					<Link
						key={user.id}
						to={"/user/" + user.id}
						className="Sandbox__UserItem clickable"
					>
						<div>{"#" + user.id}</div>
						<div>{user.username}</div>
						<div>{user.email}</div>
					</Link>
				)
			}
			</div>
		</div>
	);
}