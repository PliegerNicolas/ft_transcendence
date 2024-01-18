import { Link } from "react-router-dom";
import { UseQueryResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { UserType, UserPostType } from "../utils/types.ts"
import Api from "../utils/Api.ts";

import "../styles/sandbox.css";

import hourglass from "../assets/hourglass.svg";


// <Sandbox /> =================================================================

export default function Sandbox()
{
	const api = new Api(`http://${location.hostname}:3450`);
	const queryClient = useQueryClient();

	const usersGet = useQuery({
		queryKey: ["users"],
		queryFn: () => api.get("/users")
	});

	const usersPost = useMutation({
		mutationFn: (user: UserPostType) => api.post("/users", user),
		onSettled: invalidateUsers
	});

	const usersDel = useMutation({
		mutationFn: (id: string) => api.delete("/users/" + id),
		onSettled: invalidateUsers
	});

	function invalidateUsers() {
		queryClient.invalidateQueries({queryKey: ["users"]});
	}

	function genUser() {
		const uid = Math.random().toString().slice(-10, -1);

		return {
			username: "mayeul_" + uid, email: "mayeul_" + uid + "@example.com",
			profile: { firstName: "Mayeul", lastName: "Laneyrie" }
		};
	}

	return (
		<main className="MainContent">
			<h2>Sandbox</h2>
			<div className="Sandbox__UserList p-style">
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
					<button onClick={invalidateUsers}>
						Reload
					</button>
				</div>
				<hr />
				<UserListRender query={usersGet}/>
			</div>
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
			<div><div className="Spinner"><img src={ hourglass } /></div></div>
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