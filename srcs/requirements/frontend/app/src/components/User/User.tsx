import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import { MyContext } from "../../utils/contexts.ts";
import { FriendshipType } from "../../utils/types.ts"

import Spinner from "../Spinner.tsx";

import Me from "./Me.tsx";
import UserInfos from "./UserInfos.tsx";

import { useInvalidate, useMutateError, useGet } from "../../utils/hooks.ts";

import "../../styles/user.css";
import ConfirmPopup from "../ConfirmPopup.tsx";
import { InvitePlayer } from "../Game/Invitations.tsx";

// <UserRouter /> ==============================================================

export default function UserRouter()
{
	const params = useParams();
	const id = params.id!;

	if (id == "me")
		return (<Me />)
	return (<User />);
}

// <User /> ====================================================================

function User()
{
	const params = useParams();
	const id = params.id!;

	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const { api, addNotif } = useContext(MyContext);

	const [popup, setPopup] = useState(false);

	const getUser = useGet(["users", id]);
	const getMe = useGet(["me"]);
	const getRelations = useGet(["relationships"], getUser.isSuccess);

	const patchRelation = useMutation({
		mutationFn: ({them, status}: {them: string, status: string}) =>
			api.patch("/relationships/" + them, {status: status}),
		onSettled: () => invalidate(["relationships"]),
		onError: mutateError,
	});

	const delRelation = useMutation({
		mutationFn: (them: string) => api.delete("/relationships/" + them),
		onSettled: () => invalidate(["relationships"]),
		onError: mutateError,
	});

	const postRelation = useMutation({
		mutationFn: ({them, status}: {them: string, status: string}) =>
			api.post("/relationships/", {username: them, status}),
		onSettled: () => invalidate(["relationships"]),
		onError: mutateError,
	});

	const setMe = useMutation({
		mutationFn: ((name: string) =>
			api.post("/auth/log_as/" + name, {})) as unknown as
			MutationFunction<{ access_token: string; }, unknown>,
		onSuccess: (data: {access_token: string}) => {
			localStorage.setItem(
				"my_info", JSON.stringify({logged: true, token: data.access_token}));
			window.location.reload();
		},
		onError: e => addNotif({content: "Failed to log as: "
			+ getUser.data.username + ", " + e.message}),
	});

	if (getUser.isPending || getMe.isPending) return (
		<main className="MainContent">
			<div className="p-style">
				<Spinner />
			</div>
		</main>
	);

	if (getMe.isError) return (
		<main className="MainContent">
			<div className="p-style error-msg">
				Failed to load user {id}: {getMe.error.message}
			</div>
		</main>
	);

	if (getUser.isError) return (
		<main className="MainContent">
			<div className="p-style error-msg">
				Failed to load user {id}: {getUser.error.message}
			</div>
		</main>
	);

	const user = getUser.data;
	const me = getMe.data;

	if (me.id == user.id)
		return (<Me />);

	function getStatus()
	{
		if (!getRelations.isSuccess)
			return ("");

		const match = getRelations.data.find((ship: FriendshipType) =>
			ship.user1.id == user.id || ship.user2.id == user.id);

		if (!match)
			return ("");
		if (match.status1 == "accepted" && match.status2 == "accepted")
			return ("accepted");

		const myStatus = match.user1.id == me.id ? match.status1 : match.status2;
		const theirStatus = match.user1.id == me.id ? match.status2 : match.status1;

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

	if (!getRelations.isSuccess) return (
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

	if (getStatus() == "imblocked") return (
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
					delRelation.mutate(user.username)
				}>
					Make unblock (temp)
				</button>
			</section>
		</main>
	);

	return (
		<main className="MainContent User">
			<section>
				<UserInfos user={user} me={false} />
				<hr />
				{
					getRelations.isSuccess &&
					<OnOtherActions
						status={getStatus()}
						post={postRelation.mutate}
						patch={patchRelation.mutate}
						del={delRelation.mutate}
						name={user.username}
					/>
				}
				<InvitePlayer user={user.username} />
				<hr />
				<div style={{textAlign: "center"}}>
					<button onClick={() => setPopup(true)}>Log as {user.username}</button>
				</div>
			</section>
			{
				popup &&
				<ConfirmPopup
					title={"Log as " + user.username}
					text={<>/!\ This is a debug feature<br />
						Please don't do anything dumb using it.</>}
					cancelFt={() => setPopup(false)}
					action="Done"
					actionFt={() => setMe.mutate(user.username)}
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
		post({them: name, status: "accepted"});
	}

	function block() {
		post({them: name, status: "blocked"});
	}

	function acceptShip() {
		patch({them: name, status: "accepted"});
	}

	switch (status) {
		case "accepted": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					You are friend with {name}.
				</div>
				<button className="reject" onClick={() => del(name)}>
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
				<button className="reject" onClick={() => del(name)}>
					Reject
				</button>
			</div>
		);
		case "pending": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					Your friend request to {name} is pending.
				</div>
				<button className="reject" onClick={() => del(name)}>
					Cancel
				</button>
			</div>
		);
		case "blocked": return (
			<div className="User__ActionsButtons">
				<div className="User__Status">
					You are blocking {name}.
				</div>
				<button className="unblock" onClick={() => del(name)}>
					Unblock
				</button>
			</div>
		);
		case "imblocked": return (
			<div className="User__ActionsButtons">
				<button className="accept">
					Friend request
				</button>
				<button className="reject">
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