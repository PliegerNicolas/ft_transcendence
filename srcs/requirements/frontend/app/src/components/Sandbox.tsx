import {Link} from "react-router-dom";
import {useState, useEffect} from "react";

import Api from "../utils/Api.ts";

import hourglass from "../assets/hourglass.svg";

interface User {
	id: string,
	username: string,
	email: string,
	profile: {
		id: string,
		firstName: string,
		lastName:string
	}
}

function UserItem({user, index, length}: {user: User, index: number, length: number})
{
	return (
		<p className={
			"Sandbox__UserItem" +
			(index % 2 ? "" : " odd") +
			(!index ? " first" : "") +
			((index === length - 1) ? " last" : "")
		}>
				<span>{"#" + user.id}</span>
				<span>{user.username}</span>
				<span>{user.email}</span>
				<span>{user.profile.firstName}</span>
				<span>{user.profile.lastName}</span>
		</p>
	);
}

function Sandbox()
{
	const [userList, setUserList] = useState<User[]>([]);
	const [loadCount, setLoadCount] = useState(1);

	const api = new Api(`http://${location.hostname}:3450`);

	const userListHtml = userList.map(
		(item: User, index) =>
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
		console.log(random_value);

		api.post("/users", {
			"username": "Paul_" + random_value,
			"email": "paul_" + random_value + "@example.com",
			"profile": {
					"firstName": "Paul",
					"lastName": "Pliha"
			}
		}).then(() => setLoadCount(1))
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
				<div className="Sandbox__UserListItems">
					{ userList.length ? userListHtml : <p>There doesn't seem to be any user...</p> }
				</div>
			);
		else if (loadCount > 0)
			return (<div className="Spinner"><img src={ hourglass } /></div>);
		return (
			<div>
				<span className="error-msg">
					Failed to load user list (is the backend up?)
				</span><br />
				<button onClick={() => setLoadCount(1)}>Retry</button>
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
			<div className="Sandbox__UserList">
				<h3>User list:</h3>
				{renderSwitch()}
			</div>
			<button onClick={addUser}>Add a user</button>
			<button onClick={delUser}>Delete a user</button>
			<button onClick={() => setLoadCount(1)}>Reload</button><br />
			<Link to="/"><button>Go home</button></Link>
			<Link to="/user"><button>Check some user page</button></Link>
		</main>
	);
}

export default Sandbox;