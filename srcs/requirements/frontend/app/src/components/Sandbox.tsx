import { useContext } from "react";
import { Link } from "react-router-dom";
import { UseQueryResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { MyContext } from "../utils/contexts.ts";
import { UserType, UserPostType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import "../styles/sandbox.css";

// <Sandbox /> =================================================================

export default function Sandbox()
{
	const queryClient = useQueryClient();

	const context = useContext(MyContext);

	const usersGet = useQuery({
		queryKey: ["users"],
		queryFn: () => context.api.get("/users")
	});

	const usersPost = useMutation({
		mutationFn: (user: UserPostType) => context.api.post("/users", user),
		onSettled: () => invalidateQuery(["users"])
	});

	const chanPost = useMutation({
		mutationFn: (name: string) => context.api.post("/users/1/channels", {name}),
		onSettled: () => invalidateQuery(["allChans"])
	});

	const chanDel = useMutation({
		mutationFn: (id: number) => context.api.delete("/channels/" + id),
		onSettled: () => invalidateQuery(["allChans"])
	});

	const usersDel = useMutation({
		mutationFn: (id: string) => context.api.delete("/users/" + id),
		onSettled: () => invalidateQuery(["users"])
	});

	function invalidateQuery(key: string[]) {
		queryClient.invalidateQueries({queryKey: key});
	}

	function random_id() {
		return (Math.random().toString().slice(-10, -1));
	}

	function genUser() {
		const uid = random_id();

		return {
			username: uid,
			email: uid + "@example.com",
			profile: {
				firstName: "Mayeul",
				lastName: "Laneyrie"
			},
			password: "some random password I guess",
			oauth_id: uid
		};
	}

	if (usersPost.isError)
		console.log(usersPost.error);

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
				<button onClick={() => chanPost.mutate(random_id())}>
					Add new chan
				</button>
				<hr />
				{
					context.allChans?.isSuccess &&
					<div className="genericList">
					<div className="Sandbox__ContextItem genericListHead">
						<div>ID</div>
						<div>NAME</div>
					</div>
					{
						context.allChans.data.map((chan: {id: number, name: string}) =>
							<div key={chan.id} className="Sandbox__ContextItem">
								<div>#{chan.id}</div>
								<div>
									<span>{chan.name}</span>
								</div>
								<div>
									<button className="deleteChan" onClick={() => chanDel.mutate(chan.id)}>
										Delete
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
						disabled={!usersGet.isSuccess}
						onClick={() => usersPost.mutate(genUser())}
					>
						Add a user
					</button>
					<button
						disabled={!usersGet.isSuccess || !usersGet.data.length}
						onClick={() => usersDel.mutate(usersGet.data.pop().id)}
					>
						Delete a user
					</button>
					<button onClick={() => invalidateQuery(["users"])}>
						Reload
					</button>
				</div>
				<hr />
				<UserListRender query={usersGet}/>
			</section>
		</main>
	);
}

// <UserListRender /> ==========================================================

function UserListRender(
	{query}: {query: UseQueryResult<any, Error>}
)
{
	if (query.isPending) return (
		<div className="genericList">
			<div><Spinner /></div>
		</div>
	);

	if (query.isError) return (
		<div>
			<span className="error-msg">
				Failed to load user list: {query.error.message}
			</span><br />
		</div>
	);

	return (
		<div className="Sandbox__Scrollable">
			<div className="genericList">
			<div className="Sandbox__UserItem genericListHead">
				<div>ID</div>
				<div>USERNAME</div>
				<div>MAIL</div>
			</div>
			{
				!query.data.length ?
				<div><div>No user...</div></div> :
				query.data.map((user: UserType) =>
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