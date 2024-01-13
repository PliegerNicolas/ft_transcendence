import {Link} from "react-router-dom";
import {useState, useEffect} from "react";

import hourglass from "../assets/hourglass.svg";

function Sandbox()
{
	const [userList, setUserList] = useState([]);
	const [loadCount, setLoadCount] = useState(1);

	const userListHtml = userList.map(
		(item: {username: string}, index) =>
			<p key={index} className={ index % 2 ? "" : "odd" }>
				- {item.username}
			</p>
	);

	async function loadUserList() {
		if (loadCount <= 0)
			return ;
		if (loadCount > 5) {
			setLoadCount(-1);
			return ;
		}
		try {
			const response = await fetch(`http://${location.hostname}:3450/users`);

			if (!response.ok)
				throw new Error("Response not OK, Status: " + response.status);

			const users = await response.json();

			setUserList(users);
			setLoadCount(0);

		} catch (error: any) {
			setTimeout(() => {setLoadCount(prev => prev + 1)}, 2000);
			console.log("ERROR: " + error.message);
		}
	}

	useEffect(() => {loadUserList()}, [loadCount]);

	function renderSwitch() {
		if (!loadCount)
			return (<div className="Sandbox__UserListItems">{ userListHtml }</div>);
		else if (loadCount > 0)
			return (<div className="Spinner"><img src={ hourglass } /></div>);
		return (
			<div>
				<span style={{color: "#f9a", fontStyle: "italic"}}>
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
				<p>{loadCount}</p>
			</div>
			<Link to="/"><button>Go home</button></Link>
			<Link to="/user"><button>Check some user page</button></Link>
		</main>
	);
}

export default Sandbox;