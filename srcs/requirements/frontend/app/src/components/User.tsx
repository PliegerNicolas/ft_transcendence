import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {UserType, FriendshipType} from "../utils/types.ts"
import Api from "../utils/Api";

import "../styles/user.css";

import defaultPicture from "../assets/default_profile.png";

function FriendShipList(props : {title: string, list: JSX.Element[]})
{
	if (!props.list.length)
		return (<div />);
	return (
		<div>
			<h4>{props.title}:</h4>
			<div className="genericList"> {props.list} </div>
		</div>
	);
}

function User()
{
	const params = useParams();
	const id = params.id;

	const api = new Api(`http://${location.hostname}:3450`);

	const [user, setUser] = useState<UserType | null>(null);
	const [friendShips, setFriendships] = useState<FriendshipType[]>([]);
	const [userStatus, setUserStatus] = useState(0);

	const friendships = {
		accepted:	friendShips

			.filter((item: FriendshipType) =>
				item.status1 === "accepted" && item.status2 === "accepted"
			)
			.map((item: FriendshipType) =>
					<div className="User__FriendItem" key={item.id}>
						<div>{"#" + friend(item).id}</div>
						<Link to={"/user/" + friend(item).id}>
							{"@" + friend(item).username}
						</Link>
						<div>{item.updated_at}</div>
					</div>
			),

		pending: friendShips

			.filter((item: FriendshipType) =>
				(item.status1 === "pending" && item.user2.id === id)
				|| (item.status2 === "pending" && item.user1.id === id))

			.map((item: FriendshipType) =>
				<div className="User__FriendItem" key={item.id}>
					<div>{"#" + friend(item).id}</div>
					<Link to={"/user/" + friend(item).id}>
						{"@" + friend(item).username}
					</Link>
					<div>{item.updated_at}</div>
				</div>
			),

		toApprove: friendShips

			.filter((item: FriendshipType) =>
				(item.status1 === "pending" && item.user1.id === id)
				|| (item.status2 === "pending" && item.user2.id === id))

			.map((item: FriendshipType) =>
				<div className="User__FriendItem--approve" key={item.id}>
					<div>{"#" + friend(item).id}</div>
					<Link to={"/user/" + friend(item).id}>
						{"@" + friend(item).username}
					</Link>
					<div>{item.updated_at}</div>
					<div className="clickable"
						onClick={() => acceptFriendship(friend(item).id)}
					>
						Approve
					</div>
				</div>
			),
	};

	function friend(ship: FriendshipType) {
		return (ship.user1.id == id ? ship.user2 : ship.user1);
	}

	async function loadUser() {
		api.get("/users/" + id)
			.then(data => setUser(data))
			.catch(err => {
				err instanceof Response ? setUserStatus(err.status) : console.error(err)
			});
	}
	useEffect(() => {loadUser()}, [params]);

	async function loadFriendships() {
		api.get("/users/" + id + "/relationships")
			.then(data => setFriendships(data))
			.catch(err => {!(err instanceof Response) && console.error(err)});
	}
	useEffect(() => {loadFriendships()}, [params]);

	async function delUser() {
		api.delete("/users/" + id)
			.then(() => setUserStatus(410))
			.catch((err: Error) => {console.error(err)});
	}
	
	async function acceptFriendship(friendId: string) {
		console.log("/users/" + id + "/relationships/" + friendId);
		api.patch("/users/" + id + "/relationships/" + friendId, {status: "accepted"})
			.then((data) => {console.log(data); setTimeout(loadFriendships, 100)})
			.catch(err => console.error(err));
	}

	if (!user) return (
			<main className="MainContent">
				<p className="error-msg">
					There is no user to display...
					{ userStatus !== 0 && <div>(Error {userStatus})</div> }
				</p>
			</main>
	);

	return (
		<main className="MainContent">
			<div className="p-style">
				<h2>
					{
						user.profile.firstName
						+ " «" + user.username + "» "
						+ user.profile.lastName
					}
				</h2>
				<div className="User__Infos">
					<div className="User__PictureContainer">
						<img className="User__Picture" src={defaultPicture}/>
						<img className="User__PictureBg" src={defaultPicture}/>
					</div>
					<div className="genericList User__InfoItems">
						<div><div>Id</div> <div>{"#" + user.id}</div></div>
						<div><div>Username</div> <div>{"@" + user.username}</div></div>
						<div><div>Email</div> <div>{user.email}</div></div>
						<div><div>First Name</div> <div>{user.profile.firstName}</div></div>
						<div><div>Last Name</div> <div>{user.profile.lastName}</div></div>
					</div>
				</div>
				<hr />
				<h3>User friendships:</h3>
				<FriendShipList title="Accepted friendships" list={friendships.accepted}/>
				<FriendShipList title="Pending friendships" list={friendships.pending}/>
				<FriendShipList title="Friendships to approve" list={friendships.toApprove}/>
			</div>
			<button style={{margin: "0 15px", color: "#f9c"}} onClick={delUser}>
				Delete user
			</button>
		</main>
	);
}

export default User;