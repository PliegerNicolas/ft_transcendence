import Construction from "./Construction";
import React from "react";

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
    	console.log(xhttp.responseText);
			console.log(loaded);
    }
  };

	if (!loaded) {
 		xhttp.open("GET", "http://localhost:3450/users", true);
  	xhttp.send();
	}

	console.log("Coucou, mdr.");

	return (
		<main className="MainContent">
			<Construction />
			<div className="MainContent__UserList">
				<h3>User list:</h3>
				{ userListHtml }
			</div>
		</main>
	);
}

export default MainContent;