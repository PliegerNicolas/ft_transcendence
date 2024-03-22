import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { MyContext } from "../../utils/contexts.ts";

import Spinner from "../Spinner.tsx";

import Me from "./Me.tsx";
import UserInfos from "./UserInfos.tsx";

import { useGet, useSetMe, useRelation } from "../../utils/hooks.ts";

import "../../styles/user.css";
import ConfirmPopup from "../ConfirmPopup.tsx";
import { InvitePlayer } from "../Game/Invitations.tsx";
import RelationshipActions from "../RelationshipActions.tsx";
import { socket } from "../../App.tsx";

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

	const { me } = useContext(MyContext);

	const [popup, setPopup] = useState(false);

	const getUser = useGet(["users", id]);
	const relation = useRelation(id);
	const setMe = useSetMe();

	const [status, setStatus] = useState("offline");

	useEffect(() => {
		if (socket) {
			socket.on("userStatus", (username: string, status: string) => {
				if (username === getUser.data?.username)
					setStatus(status);
			});
			socket.emit("getUserStatus", getUser.data?.username);
		}
		return () => {
			if (socket)
				socket.off("userStatus");
		};
	}
	, [getUser.isSuccess])

	if (getUser.isPending || !me) return (
		<main className="MainContent">
			<div className="p-style">
				<Spinner />
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

	if (me.id == user.id)
		return (<Me />);

	if (!relation) return (
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

	if (relation == "imblocked") return (
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
			</section>
		</main>
	);

	return (
		<main className="MainContent User">
			<section>
				<UserInfos user={user} me={false} />
				<div className={"User__Status"}>
					Status: <span className={"Status " + status}>{status}</span>
				</div>
				<hr />
				{
					relation &&
					<RelationshipActions name={user.username} showStatus={true}/>
				}
				<div className="User__InvitePlayer">
					<InvitePlayer user={user.username} />
				</div>
				{
					me?.globalServerPrivileges === "operator" &&
					<>
						<hr />
						<div style={{textAlign: "center"}}>
							<button onClick={() => setPopup(true)}>
								Log as {user.username}
							</button>
						</div>
					</>
				}
			</section>
			{
				popup &&
				<ConfirmPopup
					title={"Log as " + user.username}
					text={<>/!\ This is a debug feature<br />
						Please don't do anything dumb using it.</>}
					cancelFt={() => setPopup(false)}
					action="Done"
					actionFt={() => setMe(user.username)}
				/>
			}
		</main>
	);
}