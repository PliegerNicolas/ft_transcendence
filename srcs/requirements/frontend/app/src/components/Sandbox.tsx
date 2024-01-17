import {Link} from "react-router-dom";
import {useState, useEffect} from "react";

import {UserType} from "../utils/types.ts"
import Api from "../utils/Api.ts";

import "../styles/sandbox.css";

import hourglass from "../assets/hourglass.svg";

function UserItem(props: {user: UserType, index: number, length: number})
{
	return (
		<Link to={"/user/" + props.user.id}>
			<p className={
				"Sandbox__UserItem genericListItem clickable" +
				(props.index % 2 ? "" : " odd") +
				(!props.index ? " first" : "") +
				((props.index === props.length - 1) ? " last" : "")
			}>
					<span>{"#" + props.user.id}</span>
					<span>{props.user.username}</span>
					<span>{props.user.email}</span>
			</p>
		</Link>
	);
}

function Sandbox()
{
	const [userList, setUserList] = useState<UserType[]>([]);
	const [loadCount, setLoadCount] = useState(1);

	const api = new Api(`http://${location.hostname}:3450`);

	const userListHtml = userList.map(
		(item: UserType, index) =>
			<UserItem key={index} user={item} index={index} length={userList.length}/>
	);

	async function loadUserList() {
		if (loadCount <= 0)
			return ;
		api.get("/users")
			.then(users => {setUserList(users); setLoadCount(0)})
			.catch(error => {
				if (loadCount > 1)
					setLoadCount(-2);
				else
					setTimeout(() => {setLoadCount(prev => prev + 1)}, 2000);
				console.error(error);
			});
	}
	useEffect(() => {loadUserList()}, [loadCount]);

	async function addUser() {
		const random_value = Math.random().toString().slice(-10, -1);

		api.post("/users", {
			"username": "Paul_" + random_value,
			"email": "paul_" + random_value + "@example.com",
			"profile": {
					"firstName": "Paul",
					"lastName": "Pliha"
			}
		}).then(() => {setLoadCount(1); setTimeout(() => setLoadCount(1), 100)})
			.catch((err) => {console.error(err)});
	}

	async function delUser() {
		if (!userList.length)
			return ;
		const id: string = userList[userList.length - 1].id;

		api.delete("/users/" + id)
			.then(() => setLoadCount(1))
			.catch((err: Error) => {console.error(err)});
	}

	function renderSwitch() {
		if (userList.length || !loadCount)
			return (
				<div className="Sandbox__Scrollable">
					<div className="genericList">
					{
						userList.length ?
						userListHtml :
						<p className="Sandbox__UserItem genericListItem odd first last">
							No user...
						</p>
					}
					</div>
				</div>
			);
		else if (loadCount > 0)
			return (<div className="Spinner"><img src={ hourglass } /></div>);
		return (
			<div>
				<span className="error-msg">
					Failed to load user list (is the backend up?)
				</span><br />
			</div>
		);
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
				<div>
					<button disabled={loadCount != 0} onClick={addUser}>
						Add a user
					</button>
					<button disabled={!userList.length} onClick={delUser}>
						Delete a user
					</button>
					<button onClick={() => setLoadCount(1)}>
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