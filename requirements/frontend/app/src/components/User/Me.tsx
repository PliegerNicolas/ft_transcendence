import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UseQueryResult } from "@tanstack/react-query";

import { FriendshipContext, MyContext } from "../../utils/contexts.ts";
import { FriendshipType, OldShip } from "../../utils/types.ts"

import Spinner from "../Spinner.tsx";

import UserInfos from "./UserInfos.tsx";

import { useGet, useRelation } from "../../utils/hooks.ts";

import "../../styles/user.css";
import Stats from "./Stats.tsx";
import { toOldShip } from "../../utils/utils.ts";
import RelationshipActions from "../RelationshipActions.tsx";
import { socket } from "../../App.tsx";

// <Me /> ====================================================================

export default function Me()
{
	const { me } = useContext(MyContext);

	const getRelations = useGet(["relationships"]);

	if (!me) return (
		<main className="MainContent">
			<div className="p-style">
				<Spinner />
			</div>
		</main>
	);

	return (
		<main className="MainContent User">
			<section>
				<UserInfos user={me} me={true} />
				<hr />
				<h3>Relationships :</h3>
				<Friendships
					id={me.username}
					query={getRelations}
				/>
				<h3>Statistics :</h3>
				<Stats username={me.username}/>
			</section>
		</main>
	);
}

// <Friendships /> =============================================================

function Friendships({id, query}: {id: string, query: UseQueryResult<any, Error>})
{
	if (query.isPending) return (
		<section>
			<Spinner />
		</section>
	);

	if (query.isError) return (
		<p className="error-msg">
			Failed to load friendships: {query.error.message}
		</p>
	);

	if (!query.data.map(toOldShip).find((elem: OldShip) =>
		((elem.status1 != "blocked" || elem.user2.username != id)
		&& (elem.status2 != "blocked" || elem.user1.username != id))
		|| (elem.status1 == "blocked" && elem.status2 == "blocked"))
	) return (
		<p className="notice-msg">
			You have no relations <span className="r">😢</span> (yet)
		</p>
	);

	return (
		<FriendshipContext.Provider	value={{id, friendships: query.data}}>
			<FriendshipList
				title="Friends"
				filter={
					(item: OldShip) =>
						item.status1 === "accepted" && item.status2 === "accepted"
				}
			/>
			<FriendshipList
				title="Friend requests"
				filter={
					(item: OldShip) =>
						(item.status1 === "pending" && item.user1.username === id)
						|| (item.status2 === "pending" && item.user2.username === id)
				}
			/>
			<FriendshipList
				title="Pending friendships"
				filter={
					(item: OldShip) =>
						(item.status1 === "pending" && item.user2.username == id)
						|| (item.status2 === "pending" && item.user1.username == id)
				}
			/>
			<hr />
			<FriendshipList
				title="Blocked users"
				filter={
					(item: OldShip) =>
						(item.status1 === "blocked" && item.user1.username == id)
						|| (item.status2 === "blocked" && item.user2.username == id)
				}
			/>
		</FriendshipContext.Provider>
	);
}

// <FriendshipList /> ==========================================================

function FriendshipList({title, filter}: {title: string, filter: Function})
{
	const {friendships} = useContext(FriendshipContext);
	const filterList = friendships.map(toOldShip).filter((item: FriendshipType) =>
		filter(item)
	);

	if (!filterList.length) return (
		<div />
	);

	return (
		<div>
			{
				!!title.length &&
				<h4> {title}:</h4>
			}
			<div className="genericList">
			{
				filterList.map((item: OldShip) =>
					<FriendItem key={item.id} item={item} />)
			}
			</div>
		</div>
	);
}

function FriendItem({item}: {item: OldShip})
{
	const {id} = useContext(FriendshipContext);

	const [status, setStatus] = useState("offline");

	const relation = useRelation(friend(item).username);

	useEffect(() => {
		if (socket) {
			socket.on("userStatus", (username: string, status: string) => {
				if (username === friend(item).username)
					setStatus(status);
			});
			socket.emit("getUserStatus", friend(item).username);
		}
		return () => {
			if (socket)
				socket.off("userStatus");
		};
	}
	, [])

	function friend(ship: OldShip) {
		return (ship.user1.username == id ? ship.user2 : ship.user1);
	}

	return (
		<div className={"User__FriendItem"} key={item.id}>
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
				relation === "accepted" &&
				<span className={"Status " + status}>{status}</span>
			}
			</div>
				<RelationshipActions name={friend(item).username} showStatus={false}/>

		</div>
	);
}