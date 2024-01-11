import React from "react";
import {Link} from "react-router-dom";

import hourglass from "../assets/hourglass.svg";

function APISandbox()
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
    if (xhttp.readyState == 4 && xhttp.status == 200) {
			setLoaded(true);
			setUserList(JSON.parse(xhttp.responseText));
			clearInterval(loadingInterval);
    }
  };

	function loadUserList() {
			if (loaded)
				return ;
			xhttp.open("GET", "http://127.0.0.1:3450/users", true);
			xhttp.send();
	}

	loadUserList();
	let loadingInterval = setInterval(loadUserList, 2000);

	return (
		<main className="MainContent">
			<h2>API Sandbox</h2>
			<p>
				This page is just a sample to test API requests. Don't mind it, it shall
				be removed sooner or later.
			</p>
			{
				<div className="APISandbox__UserList">
					<h3>User list:</h3>
					{
						loaded ?
						<div className="APISandbox__UserListItems">{userListHtml}</div> :
						<div className="Spinner"><img src={ hourglass } /></div> }
				</div>
				}
			<Link to="/">Go home</Link>
		</main>
	);
}

export default APISandbox;