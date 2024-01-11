import React from "react";
import {Link} from "react-router-dom";

import hourglass from "../assets/hourglass.svg";

function testPromise()
{
	const promise = Promise.resolve();

	promise.then(() => console.log("Coucou, "));
	console.log("mdr.");
}

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

  const xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = () => {
    if (xhttp.readyState != 4 || xhttp.status != 200 || loaded)
			return ;
		setLoaded(true);
		console.log("RESSOURCE OK!!!");
		testPromise();
		setUserList(JSON.parse(xhttp.responseText));
		clearInterval(loadingInterval);
  };

	function loadUserList() {
			if (loaded)
				return ;
			xhttp.open("GET", `http://${location.hostname}:3450/users`, true);
			xhttp.send();
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