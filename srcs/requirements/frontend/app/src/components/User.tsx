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
	const [friendShips, setFriendships] = useState([]);
	const [userStatus, setUserStatus] = useState(0);

	const friendshipHTML = friendShips.map((item: any, index) => {
		const friend = item.user1.id == id ? item.user2 : item.user1;

		return (
			<div key={index} className="User__InfoGrid" style={{margin: "0"}}>
				<div>{friend.id}</div>
				<div>{friend.username}</div>
			</div>
		);
	});

	async function loadUser() {
		api.get("/users/" + id)
			.then(data => setUser(data))
			.catch(err => {
				err instanceof Response ? setUserStatus(err.status) : console.error(err)
			});
	}
	useEffect(() => {loadUser()}, []);

	async function loadFriendships() {
		api.get("/users/" + id + "/friendships")
			.then(data => setFriendships(data))
			.catch(err => {!(err instanceof Response) && console.error(err)});
	}
	useEffect(() => {loadFriendships()}, []);

	async function delUser() {
		api.delete("/users/" + id)
			.then(() => setUserStatus(410))
			.catch((err: Error) => {console.error(err)});
	}

	return (
		<main className="MainContent">
			<h2>
				Profile of #{id}:
				{user != null && " " + user.profile.firstName + " " + user.profile.lastName}
				<button style={{margin: "-5px 20px"}} onClick={delUser}>Delete</button>
			</h2>
			{ userStatus
				?
				<p style={{color: "pink"}}>
					{ userStatus != 410 ? `Cannot load this user: ${userStatus}` : "This user was removed."}
				</p>
				:
				user != null &&
				<div className="p-style">
					<h3>User infos:</h3>
					<div className="User__InfoGrid">
						<div>Id</div> <div>{"#" + user.id} </div>
						<div>Username</div> <div>{user.username} </div>
						<div>Email</div> <div>{user.email} </div>
						<div>First Name</div> <div>{user.profile.firstName} </div>
						<div>Last Name</div> <div>{user.profile.lastName}</div>
					</div>
					<hr />
					<h3>User friendships:</h3>
					{
						friendShips.length ?
						friendshipHTML :
						"No friendship was found for this user :'-("
					}
				</div>
			}
		</main>
	);
}

export default User;