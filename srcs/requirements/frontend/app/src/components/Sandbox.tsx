import {Link} from "react-router-dom";
import {useState, useEffect} from "react";
import { useQuery } from "@tanstack/react-query";

import {UserType} from "../utils/types.ts"
import Api from "../utils/Api.ts";

import "../styles/sandbox.css";

import hourglass from "../assets/hourglass.svg";

function UserItem(props: {user: UserType})
{
	return (
		<Link to={"/user/" + props.user.id} className="Sandbox__UserItem clickable">
			<div>{"#" + props.user.id}</div>
			<div>{props.user.username}</div>
			<div>{props.user.email}</div>
		</Link>
	);
}

function Sandbox()
{
	const [userList, setUserList] = useState<UserType[]>([]);

	const api = new Api(`http://${location.hostname}:3450`);

	const query = useQuery({
		queryKey: ["users"],
		queryFn: () => api.get("/users").then(data => data)
	});

	const userListHtml = userList.map((item: UserType) =>
		<UserItem key={item.id} user={item}/>
	);

	async function addUser() {
		const random_value = Math.random().toString().slice(-10, -1);

		api.post("/users", {
			"username": "Paul_" + random_value,
			"email": "paul_" + random_value + "@example.com",
			"profile": {
					"firstName": "Paul",
					"lastName": "Pliha"
			}
		}).catch((err) => {console.error(err)});
	}

	async function delUser() {
		if (!userList.length)
			return ;
		const id: string = userList[userList.length - 1].id;

		api.delete("/users/" + id)
			.catch((err: Error) => {console.error(err)});
	}

	function renderSwitch() {
		if (query.isError) return (
			<div>
				<span className="error-msg">
					Failed to load user list (is the backend up?)
				</span><br />
			</div>
		);

		if (query.isPending) return (
			<div className="Spinner"><img src={ hourglass } /></div>
		);

		return (
			<div className="Sandbox__Scrollable">
				<div className="genericList">
				{ userList.length ?	userListHtml : <div><div>No user...</div></div> }
				</div>
			</div>
		);
	}

	function status() {
		if (query.isError)
			return (<div>Error</div>);
		if (query.isPending)
			return (<div>Pending</div>)
		return (<div>{JSON.stringify(query.data)}</div>)
	}

	return (
		<main className="MainContent">
			<h2>Sandbox</h2>
			<p>
				This page is just a sample to test frontend stuff. Don't mind it, it
				shall be removed sooner or later.
			</p>
			<div className="Sandbox__UserList p-style">
				<h3>User list:</h3>
					<div className="p-style">
						{status()}
					</div>
				<div>
					<button disabled={false} onClick={addUser}>
						Add a user
					</button>
					<button disabled={!userList.length} onClick={delUser}>
						Delete a user
					</button>
					<button>
						Reload
					</button>
				</div>
				<hr />
				{renderSwitch()}
			</div>
		</main>
	);
}

export default Sandbox;