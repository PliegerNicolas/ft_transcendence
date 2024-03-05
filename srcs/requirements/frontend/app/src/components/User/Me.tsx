import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, UseQueryResult, useMutation } from "@tanstack/react-query";

import { FriendshipContext, MyContext } from "../../utils/contexts.ts";
import { FriendshipType } from "../../utils/types.ts"

import Spinner from "../Spinner.tsx";
import ConfirmPopup from "../ConfirmPopup.tsx";

import UserInfos from "./UserInfos.tsx";

import { useInvalidate, useMutateError, useStopOnHttp } from "../../utils/utils.ts";

import "../../styles/user.css";

// <Me /> ====================================================================

export default function Me()
{
	const { api } = useContext(MyContext);

	const stopOnHttp = useStopOnHttp();
	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const [popup, setPopup] = useState(false);

	const getMe = useQuery({
		queryKey: ["me"],
		queryFn: () => api.get("/me"),
		retry: stopOnHttp
	});

	const delMe = useMutation({
		mutationFn: () => api.delete("/me"),
		onSettled: () => invalidate(["me"])
	});

	const getRelations = useQuery({
		queryKey: ["relations"],
		queryFn: () => api.get("/relationships"),
		enabled: getMe.isSuccess,
		retry: stopOnHttp
	});

	const patchRelation = useMutation({
		mutationFn: ({them, status}: {them: string, status: string}) =>
			api.patch("/relationships/" + them, {status: status}),
		onSettled: () => invalidate(["relations"]),
		onError: mutateError,
	});

	const delRelation = useMutation({
		mutationFn: (them: string) => api.delete("/relationships/" + them),
		onSettled: () => invalidate(["relations"]),
		onError: mutateError,
	});

	if (getMe.isPending) return (
		<main className="MainContent">
			<div className="p-style">
				<Spinner />
			</div>
		</main>
	);

	if (getMe.isError) return (
		<main className="MainContent">
			<div className="p-style error-msg">
				Failed to load your profile: {getMe.error.message}
			</div>
		</main>
	);

	const me = getMe.data;
	
	function friendshipAction(action: string, ship: FriendshipType) {
		const other = ship.user1.username == me.username ?
			ship.user2.username : ship.user1.username;

		switch (action) {
			case "accept":
				patchRelation.mutate({them: other, status: "accepted"});
				break ;
			case "unfriend":
			case "cancel":
			case "reject":
			case "unblock":
				delRelation.mutate(other); //TODO
				break ;
		}
	}

	return (
		<main className="MainContent User">
			<section>
				<UserInfos user={me} me={true} />
				<hr />
				<h3>Relationships:</h3>
				<Friendships
					id={me.username}
					query={getRelations}
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
					text={<> Warning: This is a permanent operation! </>}
					action="Delete"
					cancelFt={() => setPopup(false)}
					actionFt={delMe.mutate}
				/>
			}
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