import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {UserType} from "../utils/types.ts"
import Api from "../utils/Api";

interface FriendshipType {
	id: string,
	status1: string,
	status2: string,
	last_update: string,
	created_at: string,
	user1: UserType,
	user2: UserType
}

function FriendShip(props: {
	ship: FriendshipType,
	id: string,
	index: number,
	length: number
}) {
	const ship = props.ship;
	const friend = ship.user1.id == props.id ? ship.user2 : ship.user1;

	return (
		<div className={
			"User__FriendItem" +
			(props.index % 2 ? "" : " odd") +
			(!props.index ? " first" : "") +
			((props.index === props.length - 1) ? " last" : "")
		}>
			<div>{"#" + friend.id}</div>
			<div>{"@" + friend.username}</div>
			<div>{ship.last_update}</div>
		</div>
	);
}

function User()
{
	const params = useParams();
	const id = params.id;

	const api = new Api(`http://${location.hostname}:3450`);

	const [user, setUser] = useState<UserType | null>(null);
	const [friendShips, setFriendships] = useState([]);
	const [userStatus, setUserStatus] = useState(0);

	const friendshipsAccepted = friendShips
		.filter((item: FriendshipType) =>
			item.status1 === "accepted" && item.status2 === "accepted")
		.map((item: FriendshipType, index, array) =>
			<FriendShip key={index} ship={item} id={id!} index={index} length={array.length}/>
		);

	const friendshipsPending = friendShips
		.filter((item: FriendshipType) => (
			item.user1.id === id && item.status2 === "pending"
		))
		.map((item: FriendshipType, index, array) =>
			<FriendShip key={index} ship={item} id={id!} index={index} length={array.length}/>
		);

	const friendshipsToApprove = friendShips
		.filter((item: FriendshipType) => (
			item.user2.id === id && item.status2 === "pending"
		))
		.map((item: FriendshipType, index, array) =>
			<div key={index} className="clickable" onClick={() => acceptFriendship(item.user1.id)}>
				<FriendShip ship={item} id={id!} index={index} length={array.length}/>
			</div>
		);

	async function acceptFriendship(friendId: string) {
		api.patch("/users/" + id + "/friendships/" + friendId, {status: "accepted"})
			.then((data) => {console.log(data); setTimeout(loadFriendships, 100)})
			.catch(err => console.error(err));
	}

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
					{
						userStatus != 410 ?
						`Cannot load this user: ${userStatus}` :
						"This user was removed."
					}
				</p>
				:
				user != null &&
				<div className="p-style">
					<h3>User infos:</h3>
					<div className="User__InfoGrid">
						<div>Id</div> <div>{"#" + user.id} </div>
						<div>Username</div> <div>{"@" + user.username} </div>
						<div>Email</div> <div>{user.email} </div>
						<div>First Name</div> <div>{user.profile.firstName} </div>
						<div>Last Name</div> <div>{user.profile.lastName}</div>
					</div>
					<hr />
					<h3>User friendships:</h3>
					{
						friendShips.length ?
						(
							<div>
								<h4>Accepted friendships:</h4>
								{
									friendshipsAccepted.length ?
									<div className="User__FriendList">
										{friendshipsAccepted}
									</div> :
									<span className="User_NothingToSee">No friendship accepted yet...</span>
								}
								<h4>Pending friendships:</h4>
								{
									friendshipsPending.length ?
									<div className="User__FriendList">
										{friendshipsPending}
									</div> :
									<span className="User_NothingToSee">No friendship pending yet...</span>
								}
								<h4>Friendships to approve:</h4>
								{
									friendshipsToApprove.length ?
									<div className="User__FriendList">
										{friendshipsToApprove}
									</div> :
									<span className="User_NothingToSee">No friendship to approve yet...</span>
								}
							</div>
						) :
						<span className="User_NothingToSee">No friendship was found for this user :'-(</span>
					}
				</div>
			}
		</main>
	);
}

export default User;