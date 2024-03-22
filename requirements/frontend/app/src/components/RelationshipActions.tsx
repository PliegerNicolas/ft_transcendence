import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

import { MyContext } from "../utils/contexts";
import { useInvalidate, useMutateError, useRelation } from "../utils/hooks";

import "../styles/relations.css";

export default function RelationshipActions(
	{name, showStatus}:
	{name: string, showStatus: boolean})
{
	const invalidate = useInvalidate();
	const mutateError = useMutateError();

	const { api } = useContext(MyContext);

	const relation = useRelation(name);

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

	function friend() {
		postRelation.mutate({them: name, status: "accepted"});
	}

	function block() {
		postRelation.mutate({them: name, status: "blocked"});
	}

	function acceptShip() {
		patchRelation.mutate({them: name, status: "accepted"});
	}

	switch (relation) {
		case "accepted": return (
			<div className={"Relations " + showStatus}>
			{
				showStatus &&
				<div className="Relations__Status">
					You are friend with {name}.
				</div>
			}
				<button className="reject" onClick={() => delRelation.mutate(name)}>
					Unfriend
				</button>
			</div>
		);
		case "approve": return (
			<div className={"Relations " + showStatus}>
			{
				showStatus &&
				<div className="Relations__Status">
					{name} sent you a friend request.
				</div>
			}
				<button onClick={acceptShip} className="accept">
					Accept as friend
				</button>
				<button className="reject" onClick={() => delRelation.mutate(name)}>
					Reject
				</button>
			</div>
		);
		case "pending": return (
			<div className={"Relations " + showStatus}>
			{
				showStatus &&
				<div className="Relations__Status">
					Your friend request to {name} is pending.
				</div>
			}
				<button className="reject" onClick={() => delRelation.mutate(name)}>
					Cancel
				</button>
			</div>
		);
		case "blocked": return (
			<div className={"Relations " + showStatus}>
			{
				showStatus &&
				<div className="Relations__Status">
					You are blocking {name}.
				</div>
			}
				<button className="unblock" onClick={() => delRelation.mutate(name)}>
					Unblock
				</button>
			</div>
		);
		case "imblocked": return (
			<div className={"Relations " + showStatus}>
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
		<div className={"Relations " + showStatus}>
			<button onClick={friend} className="accept">
				Friend request
			</button>
			<button onClick={block} className="reject">
				Block
			</button>
		</div>
	);
}