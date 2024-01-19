import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";

import { FriendshipContext } from "../utils/contexts.ts";
import { UserType, FriendshipType } from "../utils/types.ts"
import Api from "../utils/Api";

import "../styles/user.css";

import defaultPicture from "../assets/default_profile.png";

// <User /> ====================================================================

export default function User()
{
	const params = useParams();
	const id = params.id!;

	const api = new Api(`http://${location.hostname}:3450`);

	const [user, setUser] = useState<UserType | null>(null);
	const [friendships, setFriendships] = useState<FriendshipType[]>([]);
	const [userStatus, setUserStatus] = useState(0);

	async function loadUser() {
		api.get("/users/" + id)
			.then(data => {
				setUser(data);
				loadFriendships();
			})
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

	async function delUser() {
		api.delete("/users/" + id)
			.then(() => setUserStatus(410))
			.catch((err: Error) => {console.error(err)});
	}
	
	function friendshipAction(action: string, ship: FriendshipType) {
		const friendId = ship.user1.id == id ? ship.user2.id : ship.user1.id;

		switch (action) {
			case "approve":
				api.patch("/users/" + id + "/relationships/" + friendId, {status: "accepted"})
					.then(() => {setTimeout(loadFriendships, 100)})
					.catch(err => console.error(err));
			break ;
		}
	}

	if (!user) return (
			<main className="MainContent">
				<div className="p-style error-msg">
					There is no user to display...
					{ userStatus !== 0 && <div>(Error {userStatus})</div> }
				</div>
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
				<FriendshipContext.Provider value={{id, friendships}}>
					<Friendships
						title="Accepted friendships"
						filter={
							(item: FriendshipType) =>
							item.status1 === "accepted" && item.status2 === "accepted"
						}
						actions={[]} action={friendshipAction}
					/>
					<Friendships
						title="Pending friendships"
						filter={
							(item: FriendshipType) =>
								(item.status1 === "pending" && item.user2.id === id)
								|| (item.status2 === "pending" && item.user1.id === id)
						}
						actions={[]} action={friendshipAction}
					/>
					<Friendships
						title="Friendships to approve"
						filter={
							(item: FriendshipType) =>
								(item.status1 === "pending" && item.user1.id === id)
								|| (item.status2 === "pending" && item.user2.id === id)
						}
						actions={["approve"]} action={friendshipAction}
					/>
				</FriendshipContext.Provider>
			</div>
			<button style={{margin: "0 15px", color: "#f9c"}} onClick={delUser}>
				Delete user
			</button>
		</main>
	);
}

// <Friendships /> =============================================================

function Friendships(props: {
	title: string,
	filter: Function,
	actions: string[],
	action: Function
})
{
	const {id, friendships} = useContext(FriendshipContext);
	const filterList = friendships.filter((item: FriendshipType) =>
		props.filter(item)
	);
	const actionClass = props.actions.join(" ");

	function friend(ship: FriendshipType) {
		return (ship.user1.id == id ? ship.user2 : ship.user1);
	}

	if (!filterList.length) return (
		<div />
	);

	return (
		<div>
			<h4> {props.title}:</h4>
			<div className="genericList">
			{
				filterList.map((item: FriendshipType) =>
					<div className={"User__FriendItem " + actionClass} key={item.id}>
						<div>
							{"#" + friend(item).id}
						</div>
						<Link to={"/user/" + friend(item).id}>
							{"@" + friend(item).username}
						</Link>
						<div>
							{item.updated_at}
						</div>
						{
							props.actions.map((actionItem, index) =>
								<div
									key={index}
									className={"clickable " + actionClass}
									onClick={() => props.action(actionItem, item)}
								>
									{actionItem}
								</div>
							)
						}
					</div>)
			}
			</div>
		</div>
	);
}