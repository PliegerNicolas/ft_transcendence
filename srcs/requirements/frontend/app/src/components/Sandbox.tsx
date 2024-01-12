import React from "react";
import {Link} from "react-router-dom";

import hourglass from "../assets/hourglass.svg";

function Sandbox()
{
	const [userList, setUserList] = React.useState([]);
	const [loaded, setLoaded] = React.useState(false);

	const userListHtml = userList.map(
		(item: {username: string}, index) =>
			<p key={index} className={ index % 2 ? "" : "odd" }>
				- {item.username}
			</p>
	);

	async function loadUserList() {
		if (loaded)
			return ;
		try {
			const response = await fetch(`http://${location.hostname}:3450/users`);
			const users = await response.json();
			clearInterval(loadingInterval);
			setLoaded(true);
			setUserList(users);
		} catch (error: any) {
			console.log("Failed to load user list: " + error.message);
		}
	}

	loadUserList();
	let loadingInterval = setInterval(loadUserList, 2000);

	return (
		<main className="MainContent">
			<h2>Sandbox</h2>
			<p>
				This page is just a sample to test frontend stuff. Don't mind it, it
				shall be removed sooner or later.
			</p>
			{
				<div className="Sandbox__UserList">
					<h3>User list:</h3>
					{
						loaded ?
						<div className="Sandbox__UserListItems">{ userListHtml }</div> :
						<div className="Spinner"><img src={ hourglass } /></div> }
				</div>
				}
			<Link to="/"><button>Go home</button></Link>
		</main>
	);
}

export default Sandbox;