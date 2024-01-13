import React from "react";
import {Link, useNavigate} from "react-router-dom";

// import hourglass from "../assets/hourglass.svg";

function Sandbox()
{
	const [userList, setUserList] = React.useState([]);
	const [loadCount, setLoadCount] = React.useState(0);
	const navigate = useNavigate();

	const userListHtml = userList.map(
		(item: {username: string}, index) =>
			<p key={index} className={ index % 2 ? "" : "odd" }>
				- {item.username}
			</p>
	);

	async function loadUserList() {
		try {
			const response = await fetch(`http://${location.hostname}:3450/users`);
			const users = await response.json();

			setLoadCount(1);
			setUserList(users);

		} catch (error: any) {
			setLoadCount(2);
		}
	}

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
						(loadCount == 1 ?
							<div className="Sandbox__UserListItems">{ userListHtml }</div>
						:
							<button onClick={loadUserList}>Load user list</button>)/*
						<div className="Spinner"><img src={ hourglass } /></div>*/
						}
						{
							loadCount == 2 && <span style={{color: "#f9a"}}>Failed to load</span>
						}
				</div>
				}
			<Link to="/"><button>Go home</button></Link>
			<button onClick={() => navigate("/user")}>Check some user page</button>
		</main>
	);
}

export default Sandbox;