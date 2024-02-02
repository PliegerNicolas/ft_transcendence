import { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";

import { FriendshipContext } from "../utils/contexts.ts";
import { FriendshipType } from "../utils/types.ts"
import Api from "../utils/Api";

import Spinner from "./Spinner.tsx";

import "../styles/user.css";

import defaultPicture from "../assets/default_profile.png";

// <User /> ====================================================================

export default function User()
{
	const params = useParams();
	const id = params.id!;
	const queryClient = useQueryClient();
	const api = new Api(`http://${location.hostname}:3450`);

	const userGet = useQuery({
		queryKey: ["users", id],
		queryFn: () => api.get("/users/" + id),
		retry: (count, error) => !error.message.includes("404") && count < 3
	});

	const userDel = useMutation({
		mutationFn: () => api.delete("/users/" + id),
		onSettled: () => invalidate(["users", id])
	});

	const friendshipsGet = useQuery({
		queryKey: ["users", id, "friends"],
		queryFn: () => api.get("/users/" + id + "/relationships"),
		enabled: userGet.isSuccess,
		retry: (count, error) => !error.message.includes("404") && count < 3
	});

	const friendshipAccept = useMutation({
		mutationFn: (friendId: string) =>
			api.patch(
				"/users/" + id + "/relationships/" + friendId,
				{status: "accepted"}
			),
		onSettled: () => invalidate(["users", id, "friends"])
	});

	function invalidate(queryKey: Array<any>) {
		queryClient.invalidateQueries({queryKey});
	}

	if (!userGet.isSuccess) return (
		<main className="MainContent">
		{
			userGet.isPending ?
			<div className="p-style">
				<Spinner />
			</div> :
			<div className="p-style error-msg">
				Failed to load user #{id}: {userGet.error.message}
			</div>
		}
		</main>
	);

	const user = userGet.data;
	
	function friendshipAction(action: string, ship: FriendshipType) {
		switch (action) {
			case "approve":
				friendshipAccept.mutate(
					ship.user1.id == id ? ship.user2.id : ship.user1.id
				);
			break ;
		}
	}

	return (
		<main className="MainContent">
			<div className="p-style">
				<h2>
					{
						user.profile.firstName
						+ " « " + user.username + " » "
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
				<Friendships id={id} query={friendshipsGet} action={friendshipAction}/>
			</div>
			<button
				style={{margin: "0 15px", color: "#f9c"}}
				onClick={() => userDel.mutate()}
			>
				Delete user
			</button>
		</main>
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
		<div className="p-style">
			<Spinner />
		</div>
	);

	if (props.query.isError) return (
		<div className="p-style error-msg">
			Failed to load friendships: {props.query.error.message}
		</div>
	);

	if (!props.query.data.length) return (
		<div className="p-style notice-msg">
			No friendship for this user...
		</div>
	);

	return (
		<FriendshipContext.Provider	value={{...props,	friendships: props.query.data}}>
			<FriendshipList
				title="Accepted friendships"
				filter={
					(item: FriendshipType) =>
					item.status1 === "accepted" && item.status2 === "accepted"
				}
				actions={[]}
			/>
			<FriendshipList
				title="Pending friendships"
				filter={
					(item: FriendshipType) =>
						(item.status1 === "pending" && item.user2.id === props.id)
						|| (item.status2 === "pending" && item.user1.id === props.id)
				}
				actions={[]}
			/>
			<FriendshipList
				title="Friendships to approve"
				filter={
					(item: FriendshipType) =>
						(item.status1 === "pending" && item.user1.id === props.id)
						|| (item.status2 === "pending" && item.user2.id === props.id)
				}
				actions={["approve"]}
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
									onClick={() => action(actionItem, item)}
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