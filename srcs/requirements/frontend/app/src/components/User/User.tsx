import { useContext, useState } from "react";
import { useParams } from "react-router-dom";

import { MyContext } from "../../utils/contexts.ts";

import Spinner from "../Spinner.tsx";

import Me from "./Me.tsx";
import UserInfos from "./UserInfos.tsx";

import { useGet, useSetMe, useStatus } from "../../utils/hooks.ts";

import "../../styles/user.css";
import ConfirmPopup from "../ConfirmPopup.tsx";
import { InvitePlayer } from "../Game/Invitations.tsx";
import RelationshipActions from "../RelationshipActions.tsx";

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
	const status = useStatus(id);
	const setMe = useSetMe();

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

	if (!status) return (
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

	if (status == "imblocked") return (
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
				<hr />
				{
					status &&
					<RelationshipActions name={user.username} />
				}
				<div className="User__InvitePlayer">
					<InvitePlayer  user={user.username} />
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