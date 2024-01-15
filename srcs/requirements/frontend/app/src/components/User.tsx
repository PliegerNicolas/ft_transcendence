import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {UserType} from "../utils/types.ts"
import Api from "../utils/Api";

function User()
{
	const params = useParams();
	const id = params.id;

	const api = new Api(`http://${location.hostname}:3450`);

	const [user, setUser] = useState<UserType | null>(null);
	const [status, setStatus] = useState(0);

	async function loadUser() {
		api.get("/users/" + id)
			.then(data => setUser(data))
			.catch(err => {
				err instanceof Response ? setStatus(err.status) : console.error(err)
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
			<h2>
				Profile of #{id}
				{user != null && ": " + user.profile.firstName + " " + user.profile.lastName}
			</h2>
			{ status
				?
				<p style={{color: "pink"}}>
					{ status != 410 ? `Cannot load this user: ${status}` : "This user was removed."}
				</p>
				:
				user != null &&
				<div className="p-style">
					<button onClick={delUser}>Delete</button>
					<div className="User__InfoGrid">
						<div>Id</div> <div>{"#" + user.id} </div>
						<div>Username</div> <div>{user.username} </div>
						<div>Email</div> <div>{user.email} </div>
						<div>First Name</div> <div>Name: {user.profile.firstName} </div>
						<div>Last Name</div> <div>{user.profile.lastName}</div>
					</div>
				</div>
			}
		</main>
	);
}

export default User;