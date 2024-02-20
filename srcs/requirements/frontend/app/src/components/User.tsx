import { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";

import { FriendshipContext, MyContext } from "../utils/contexts.ts";
import { FriendshipType } from "../utils/types.ts"

import Spinner from "./Spinner.tsx";

import { stopOnHttp } from "../utils/utils.ts";

import "../styles/user.css";

import defaultPicture from "../assets/default_profile.png";

// <User /> ====================================================================

export default function User()
{
	const params = useParams();
	const id = params.id!;
	const queryClient = useQueryClient();
	const { api } = useContext(MyContext);

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
		mutationFn: ({friendId, status}: {friendId: string, status: string}) =>
			api.patch(
				"/users/" + id + "/relationships/" + friendId,
				{status: status}
			),
		onSettled: () => invalidate(["users", id, "friends"]),
	});

	const delFriendship = useMutation({
		mutationFn: (friendId: string) =>
			api.delete("/users/" + id + "/relationships/" + friendId),
		onSettled: () => invalidate(["users", id, "friends"]),
	});

	const postFriendship = useMutation({
		mutationFn: () => api.post("/users/" + id + "/relationships/", {})
	});

	function invalidate(queryKey: Array<any>) {
		queryClient.invalidateQueries({queryKey});
	}

	if (!getUser.isSuccess) return (
		<main className="MainContent">
		{
			getUser.isPending ?
			<div className="p-style">
				<Spinner />
			</div> :
			<div className="p-style error-msg">
				Failed to load user #{id}: {getUser.error.message}
			</div>
		}
		</main>
	);

	const user = getUser.data;
	
	function friendshipAction(action: string, ship: FriendshipType) {
		const other = ship.user1.username == id ? ship.user2.username : ship.user1.username;

		switch (action) {
			case "approve":
				patchFriendship.mutate({
					friendId: other,
					status: "accepted"
				});
				break ;
			case "delete":
			case "cancel":
			case "reject":
				delFriendship.mutate(other);
				break ;
		}
	}

	return (
		<main className="MainContent">
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
					user.id == 1 ?
					<>
						<h3>Your friendships:</h3>
						<Friendships
							id={id}
							query={getFriendships}
							action={friendshipAction}
						/>
					</> :
					<div className="User__ActionsButtons">
						<button>Add as friend</button>
						<button>Block</button>
					</div>
				}
			</section>
			<button
				style={{margin: "0 15px", color: "#f9c"}}
				onClick={() => delUser.mutate()}
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
		<section>
			<Spinner />
		</section>
	);

	if (props.query.isError) return (
		<p className="error-msg">
			Failed to load friendships: {props.query.error.message}
		</p>
	);

	if (!props.query.data.length) return (
		<p className="notice-msg">
			You have no friendships <span className="r">😢</span> (yet)
		</p>
	);

	return (
		<FriendshipContext.Provider	value={{...props, friendships: props.query.data}}>
			<FriendshipList
				title="Accepted friendships"
				filter={
					(item: FriendshipType) =>
					item.status1 === "accepted" && item.status2 === "accepted"
				}
				actions={["delete"]}
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
			<FriendshipList
				title="Friendships to approve"
				filter={
					(item: FriendshipType) =>
						(item.status1 === "pending" && item.user1.username === props.id)
						|| (item.status2 === "pending" && item.user2.username === props.id)
				}
				actions={["reject", "approve"]}
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
			<h4> {props.title}:</h4>
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
						{
							props.actions.map((actionItem, index) =>
								<div
									key={index}
									className={"clickable " + actionItem}
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