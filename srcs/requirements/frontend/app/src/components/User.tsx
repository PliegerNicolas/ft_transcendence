import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Api from "../utils/Api";

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

function User()
{
	const params = useParams();
	const id = params.id;
	const api = new Api(`http://${location.hostname}:3450`);
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState(0);

	async function loadUser() {
		api.get("/users/" + id)
			.then(data => setUser(data))
			.catch(err => {
				if (err instanceof Response)
					setStatus(err.status);
				else
					console.error(err);
			});
	}
	useEffect(() => {loadUser()}, []);

	async function delUser() {
		api.delete("/users/" + id)
			.then(() => setStatus(410))
			.catch((err: Error) => {console.error(err)});
	}

	return (
		<main className="MainContent">
			<h2>Profile of #{id}{user ? ": " + user.profile.firstName + " " + user.profile.lastName : ""}</h2>
			{ status ? 
				<p style={{color: "pink"}}>{ status != 410 ? `Cannot load this user: ${status}` : "This user was removed."}</p> :
				( user ?
				<p>
					<button onClick={delUser}>Delete</button>
					<ul>
						<li>{"#" + user.id}</li>
						<li>{user.username}</li>
						<li>{user.email}</li>
						<li>{user.profile.firstName}</li>
						<li>{user.profile.lastName}</li>
					</ul>
				</p> :
				""
				)
			}
		</main>
	);
}

export default User;