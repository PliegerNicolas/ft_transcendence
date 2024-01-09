import Construction from "./Construction";
import React from "react";
import hourglass from "../assets/hourglass.svg";

function MainContent()
{
	const [userList, setUserList] = React.useState([]);
	const [loaded, setLoaded] = React.useState(false);

	const userListHtml = userList.map(
		(item: {username: string}, index) => <p key={index}>- {item.username}</p>
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
		if (!loaded) {
			xhttp.open("GET", "http://localhost:3450/users", true);
			xhttp.send();
		}
	}

	loadUserList();
	let loadingInterval = setInterval(loadUserList, 1000);

	return (
		<main className="MainContent">
			<Construction />
			{
				<div className="MainContent__UserList">
					<h3>User list:</h3>
					{ loaded ? userListHtml : <div className="Spinner"><img src={ hourglass } /></div> }
				</div>
				}
		</main>
	);
}

export default MainContent;