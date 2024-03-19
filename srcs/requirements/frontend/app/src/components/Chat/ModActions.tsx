import { useContext } from "react";
import { ChatContentContext, MyContext } from "../../utils/contexts";
import { useInvalidate, useMutateError } from "../../utils/hooks";
import { MemberType } from "../../utils/types";
import { useMutation } from "@tanstack/react-query";
import { getChanRole, isAdmin, isBanned, isMuted } from "../../utils/utils";
import { socket } from "../../App";

export default function ModActions(
	{member, popupFn}:
	{member: MemberType, popupFn: Function}
)
{
	const user = member.user;
	const username = user.username;

	const { api, me } = useContext(MyContext);
	const { chan, role } = useContext(ChatContentContext);

	const mutateError = useMutateError();
	const invalidate = useInvalidate();

	const action = useMutation({
		mutationFn: (action: string) =>
			api.patch(
				"/channels/" + chan.id + "/manage_access",
				{action, usernames: [username]}
			),
		onError: mutateError,
		onSuccess: () => invalidate(["channels", chan.id]),
	});

	if (
		user.id === me?.id
		|| role !== "owner" && role !== "operator"
	) return (<></>);
	if (member.role === "owner") return (
		<div className="Msg__ModActions owner">Owner</div>
	);

	return (
		<div className="Msg__ModActions">
			{
				isBanned(chan, user.id) ?
				<button
					className="ban"
					onClick={() => popupFn(
						<>Are you sure you want to unban {username} from this channel?</>,
						() => {action.mutate("deban")}
					)}
				>
					Unban
				</button> :
				<button
					className="ban"
					onClick={() => popupFn(
						<>Are you sure you want to ban {username} from this channel?</>,
						() => {action.mutate("ban")}
					)}
				>
					Ban
				</button>
			}
			{
				getChanRole(chan, user.id) &&
				<button
					className="kick"
					onClick={() => popupFn(
						<>Are you sure you want to kick {username} from this channel?</>,
						() => {action.mutate("kick")}
					)}
				>
					Kick
				</button>
			}
			{
				isMuted(chan, user.id) ?
				<button
					className="mute"
					onClick={() => popupFn(
						<>Are you sure you want to unmute {username} on this channel?</>,
						() => {action.mutate("unmute"); socket.emit('refreshClientPage', username, 0);}
					)}
				>
					Unmute
				</button> :
				<button
					className="mute"
					onClick={() => popupFn(
						<>Are you sure you want to mute {username} on this channel?</>,
						() => {action.mutate("mute"); socket.emit('refreshClientPage', username, 1000);}
					)}
				>
					Mute
				</button>
			}
			{
				role === "owner" && getChanRole(chan, user.id) && (
					isAdmin(chan, user.id) ?
					<button
						className="unadmin"
						onClick={() => popupFn(
							<>Are you sure you want to retrieve {username}'s admin privileges
							on this channel?</>,
							() => {action.mutate("demote")}
						)}
					>
						Unadmin
					</button> :
					<button
						className="admin"
						onClick={() => popupFn(
							<>Are you sure you want to make {username} an admin on this channel?</>,
							() => {action.mutate("promote")}
						)}
					>
						Admin
					</button>
				)
			}
		</div>
	);
}