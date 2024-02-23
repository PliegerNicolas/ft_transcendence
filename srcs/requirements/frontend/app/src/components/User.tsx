import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";

import { FriendshipContext, MyContext } from "../utils/contexts.ts";
import { FriendshipType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";
import ConfirmPopup from "./ConfirmPopup.tsx";

import { stopOnHttp } from "../utils/utils.ts";

import "../styles/user.css";

import defaultPicture from "../assets/default_profile.png";
//import addFriend from "../assets/add-friend.svg";
//import rmFriend from "../assets/rm-friend.svg";
//import blockUser from "../assets/user-block.svg";

// <User /> ====================================================================

export default function User()
{
	const params = useParams();
	const id = params.id!;
	const queryClient = useQueryClient();
	const { api, addNotif } = useContext(MyContext);

	const [popup, setPopup] = useState(false);

	const getUser = useQuery({
		queryKey: ["users", id],
		queryFn: () => api.get("/users/" + id),
		retry: stopOnHttp
	});

	const delUser = useMutation({
		mutationFn: () => api.delete("/users/" + id),
		onSettled: () => invalidate(["users", id])
	});

	const getFriendships = useQuery({
		queryKey: ["users", id, "friends"],
		queryFn: () => api.get("/users/" + id + "/relationships"),
		enabled: getUser.isSuccess,
		retry: stopOnHttp
	});

	const patchFriendship = useMutation({
		mutationFn: ({me, them, status}: {me: string, them: string, status: string}) =>
			api.patch(
				"/users/" + me + "/relationships/" + them,
				{status: status}
			),
		onSettled: () => invalidate(["users", id, "friends"]),
		onError: error => addNotif({content: error.message}),
	});

	const delFriendship = useMutation({
		mutationFn: ({me, them}: {me: string, them: string}) =>
			api.delete("/users/" + me + "/relationships/" + them),
		onSettled: () => invalidate(["users", id, "friends"]),
		onError: error => addNotif({content: error.message}),
	});

	const postFriendship = useMutation({
		mutationFn: ({me, other, status}: {me: string, other: string, status: string}) =>
			api.post("/users/" + me + "/relationships/", {username: other, status}),
		onSettled: () => invalidate(["users", id, "friends"]),
		onError: error => addNotif({content: error.message}),
	});

	function invalidate(queryKey: Array<any>) {
		queryClient.invalidateQueries({queryKey});
	}

	if (getUser.isPending) return (
		<main className="MainContent">
			<div className="p-style">
				<Spinner />
			</div>
		</main>
	);

	if (getUser.isError) return (
		<main className="MainContent">
			<div className="p-style error-msg">
				Failed to load user #{id}: {getUser.error.message}
			</div>
		</main>
	);

	const user = getUser.data;
	
	function friendshipAction(action: string, ship: FriendshipType) {
		const other = ship.user1.username == id ? ship.user2.username : ship.user1.username;

		switch (action) {
			case "accept":
				patchFriendship.mutate({
					me: id,
					them: other,
					status: "accepted"
				});
				break ;
			case "unfriend":
			case "cancel":
			case "reject":
			case "unblock":
				if (id == "mlaneyri")
					delFriendship.mutate({me: "mlaneyri", them: other}); //TODO
				else
					delFriendship.mutate({me: "mlaneyri", them: id}); //TODO
				break ;
		}
	}
	
	function getStatus()
	{
		if (!getFriendships.isSuccess)
			return ("");

		const match = getFriendships.data.find((ship: FriendshipType) =>
			ship.user1.id == "1" || ship.user2.id == "1");

		if (!match)
			return ("");
		if (match.status1 == "accepted" && match.status2 == "accepted")
			return ("accepted");

		const myStatus = match.user1.id == "1" ? match.status1 : match.status2;
		const theirStatus = match.user1.id == "1" ? match.status2 : match.status1;

		if (theirStatus == "blocked")
			return ("imblocked");
		if (myStatus == "blocked")
			return ("blocked");
		if (myStatus == "pending")
			return ("approve");
		if (theirStatus == "pending")
			return ("pending");
		return ("");
	}

	if (user.id != 1 && !getFriendships.isSuccess) return ( //TODO
		<main className="MainContent User">
			<section>
				<h2>
					{
						user.profile?.firstName
						+ " « " + user.username + " » "
						+ user.profile?.lastName
					}
				</h2>
			</section>
		</main>
	);

	if (user.id != 1 && getStatus() == "imblocked") return ( //TODO
		<main className="MainContent User">
			<section>
				<h2>
					{
						user.profile?.firstName
						+ " « " + user.username + " » "
						+ user.profile?.lastName
					}
				</h2>
				<div className="error-msg">
					You've been blocked by this user.
				</div>
				<button onClick={() =>
					delFriendship.mutate({me: user.username, them: "mlaneyri"}) //TODO
				}>
					Make unblock (temp)
				</button>
			</section>
		</main>
	);

	return (
		<main className="MainContent User">
			<section>
				<h2>
					{
						user.profile?.firstName
						+ " « " + user.username + " » "
						+ user.profile?.lastName
					}
				</h2>
				<div className="User__Infos">
					<div className="User__PictureContainer">
						<label htmlFor={user.id == 1 ? "userPicture" : "machin"}>
							<img className="User__Picture" src={defaultPicture}/>
						</label>
						<img className="User__PictureBg" src={defaultPicture}/>
					</div>
					<div className="genericList User__InfoItems">
						<div><div>Id</div> <div>{"#" + user.id}</div></div>
						<div><div>Username</div> <div>{"@" + user.username}</div></div>
						<div><div>Email</div> <div>{user.email}</div></div>
						<div><div>First Name</div> <div>{user.profile?.firstName}</div></div>
						<div><div>Last Name</div> <div>{user.profile?.lastName}</div></div>
					</div>
				</div>
				<input
					type="file" id="userPicture" name="userPicture"
					style={{display: "none"}}
					onChange={e => {console.log(e.currentTarget.files![0]);}}
				/>
				<hr />
				{
					user.id != 1 && getFriendships.isSuccess &&
					<OnOtherActions
						status={getStatus()}
						post={postFriendship.mutate}
						patch={patchFriendship.mutate}
						del={delFriendship.mutate}
						name={user.username}
					/>
				}
				{
					user.id != 1 && getFriendships.isSuccess &&
					<div className="User__ActionsButtons">
						<hr />
						<button onClick={() =>
							postFriendship.mutate({other: "mlaneyri", me: user.username, status: "accepted"})
						}>
							Make friend request me (temp)
						</button>
						<button onClick={() =>
							postFriendship.mutate({other: "mlaneyri", me: user.username, status: "blocked"})
						}>
							Make block me  (temp)
						</button>
					</div>
				}
				<h3>Relationships:</h3>
				<Friendships
					id={id}
					query={getFriendships}
					action={friendshipAction}
				/>
			</section>
			<button
				style={{margin: "0 15px"}}
				className="danger"
				onClick={() => setPopup(true)}
			>
				Delete account
			</button>
			{
				popup &&
				<ConfirmPopup
					title="Are you sure you want to delete your account?"
					text={
						<> Of course, for now, you may delete any account, but later it will
						be only yours.<br /><br />
						** TODO ** remove this in due time.<br /><br />
						Warning: This is a permanent operation! </>
					}
					action="Delete"
					cancelFt={() => setPopup(false)}
					actionFt={delUser.mutate}
				/>
			}
		</main>
	);
}

// <OnOtherActions /> ==========================================================

function OnOtherActions(
	{status, post, patch, del, name}:
	{status: string, post: Function, patch: Function, del: Function, name: string}
)
{
	function friend() {
		post({me: "mlaneyri", other: name, status: "accepted"});
	}

	function block() {
		post({me: "mlaneyri", other: name, status: "blocked"});
	}

	function acceptShip() {
		patch({me: "mlaneyri", them: name, status: "accepted"});
	}

	switch (status) {
		case "accepted": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					You are friend with {name}.
				</div>
				<button
					 className="reject"
					 onClick={() => del({me: "mlaneyri", them: name})}
				> {/* TODO */}
					Unfriend
				</button>
			</div>
		);
		case "approve": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					{name} sent you a friend request.
				</div>
				<button onClick={acceptShip} className="accept">
					Accept as friend
				</button>
				<button
					className="reject"
					onClick={() => del({me: "mlaneyri", them: name})}
				>
					Reject
				</button>
			</div>
		);
		case "pending": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					Your friend request to {name} is pending.
				</div>
				<button
					className="reject"
					onClick={() => del({me: "mlaneyri", them: name})}
				>
					Cancel
				</button>
			</div>
		);
		case "blocked": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					You are blocking {name}.
				</div>
				<button
					className="unblock"
					onClick={() => del({me: "mlaneyri", them: name})}
				>
					Unblock
				</button>
			</div>
		);
		case "imblocked": return (
			<div className="User__ActionsButtons">
				<button
					className="accept"
				>
					Friend request
				</button>
				<button
					className="reject"
					onClick={() => patch({me: "mlaneyri", them: name, status: "blocked"})}
				>
					Block
				</button>
			</div>
		);
	}

	return (
		<div className="User__ActionsButtons">
			<button onClick={friend} className="accept">
				Friend request
			</button>
			<button onClick={block} className="reject">
				Block
			</button>
		</div>
	);
}

// <Friendships /> =============================================================

function Friendships(props: {
	id: string,
	query: UseQueryResult<any, Error>,
	action: Function
})
{
	if (props.query.isPending) return (
		<section>
			<Spinner />
		</section>
	);

	if (props.query.isError) return (
		<p className="error-msg">
			Failed to load friendships: {props.query.error.message}
		</p>
	);

	if (!props.query.data.find((elem: FriendshipType) =>
		((elem.status1 != "blocked" || elem.user2.username != props.id)
		&& (elem.status2 != "blocked" || elem.user1.username != props.id))
		|| (elem.status1 == "blocked" && elem.status2 == "blocked"))
	) return (
		<p className="notice-msg">
			You have no relations <span className="r">😢</span> (yet)
		</p>
	);

	return (
		<FriendshipContext.Provider	value={{...props, friendships: props.query.data}}>
			<FriendshipList
				title="Friends"
				filter={
					(item: FriendshipType) =>
					item.status1 === "accepted" && item.status2 === "accepted"
				}
				actions={["unfriend"]}
			/>
			<FriendshipList
				title="Friend requests"
				filter={
					(item: FriendshipType) =>
						(item.status1 === "pending" && item.user1.username === props.id)
						|| (item.status2 === "pending" && item.user2.username === props.id)
				}
				actions={["reject", "accept"]}
			/>
			<FriendshipList
				title="Pending friendships"
				filter={
					(item: FriendshipType) =>
						(item.status1 === "pending" && item.user2.username == props.id)
						|| (item.status2 === "pending" && item.user1.username == props.id)
				}
				actions={["cancel"]}
			/>
			<hr />
			<FriendshipList
				title="Blocked users"
				filter={
					(item: FriendshipType) =>
						(item.status1 === "blocked" && item.user1.username == props.id)
						|| (item.status2 === "blocked" && item.user2.username == props.id)
				}
				actions={["unblock"]}
			/>
		</FriendshipContext.Provider>
	);
}

// <FriendshipList /> ==========================================================

function FriendshipList(props: {
	title: string,
	filter: Function,
	actions: string[],
})
{
	const {id, friendships, action} = useContext(FriendshipContext);
	const filterList = friendships.filter((item: FriendshipType) =>
		props.filter(item)
	);

	const actionClass = props.actions.join(" ");

	function friend(ship: FriendshipType) {
		return (ship.user1.username == id ? ship.user2 : ship.user1);
	}

	if (!filterList.length) return (
		<div />
	);

	return (
		<div>
			{
				!!props.title.length &&
				<h4> {props.title}:</h4>
			}
			<div className="genericList">
			{
				filterList.map((item: FriendshipType) =>
					<div className={"User__FriendItem " + actionClass} key={item.id}>
						<div>
							{"#" + friend(item).id}
						</div>
						<div>
						<Link to={"/user/" + friend(item).username}>
							{"@" + friend(item).username}
						</Link>
						</div>
						<div>
						{
							props.actions.map((actionItem, index) =>
								<button
									key={index}
									className={actionItem}
									onClick={() => action(actionItem, item)}
								>
									{actionItem}
								</button>
							)
						}
						</div>
					</div>)
			}
			</div>
		</div>
	);
}