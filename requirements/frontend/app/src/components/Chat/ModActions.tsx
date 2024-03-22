import { useContext, useState } from "react";
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

	const [duration, setDuration] = useState("60");

	const actionMutate = useMutation({
		mutationFn: ({action, duration}: {action: string, duration: string | undefined}) =>
			api.patch(
				"/channels/" + chan.id + "/manage_access",
				{action, usernames: [username], muteDuration: duration}
			),
		onError: mutateError,
		onSuccess: () => {
			socket.emit("channelAction");
			invalidate(["channels", chan.id]);
		},
	});

	function mutate(action: string, duration = undefined as string | undefined) {
		actionMutate.mutate({action, duration})
	}

	if (
		user.id === me?.id
		|| role !== "owner" && role !== "operator"
	) return (<></>);
	if (member.role === "owner") return (
		<div className="Msg__ModActions owner">Owner</div>
	);

	function handleDurationChange(e: React.ChangeEvent<HTMLInputElement>) {
		setDuration(e.target.value);
		popupFn(
			<>
				Are you sure you want to mute {username} on this channel?<br /><br />
				Mute duration (in seconds):
				<div style={{textAlign: "center"}}>
					<input
						type="number"
						list="UserSuggestions"
						value={e.target.value}
						onChange={handleDurationChange}
					/>
				</div>
			</>,
			() => {mutate("mute", e.target.value); socket.emit('refreshClientPage', username, 1000);}
		);
	}

	return (
		<div className="Msg__ModActions">
			{
				isBanned(chan, user.id) ?
				<button
					className="ban"
					onClick={() => popupFn(
						<>Are you sure you want to unban {username} from this channel?</>,
						() => {mutate("deban")}
					)}
				>
					Unban
				</button> :
				<button
					className="ban"
					onClick={() => popupFn(
						<>Are you sure you want to ban {username} from this channel?</>,
						() => {mutate("ban")}
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
						() => {mutate("kick")}
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
						() => {mutate("unmute"); socket.emit('refreshClientPage', username, 0);}
					)}
				>
					Unmute
				</button> :
				<button
					className="mute"
					onClick={() => popupFn(
						<>
							Are you sure you want to mute {username} on this channel?<br /><br />
							Mute duration (in seconds):
							<div style={{textAlign: "center"}}>
								<input
									type="number"
									list="UserSuggestions"
									value={duration}
									onChange={handleDurationChange}
								/>
							</div>
						</>,
						() => {mutate("mute", duration); socket.emit('refreshClientPage', username, 1000);}
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
							() => {mutate("demote")}
						)}
					>
						Unadmin
					</button> :
					<button
						className="admin"
						onClick={() => popupFn(
							<>Are you sure you want to make {username} an admin on this channel?</>,
							() => {mutate("promote")}
						)}
					>
						Admin
					</button>
				)
			}
		</div>
	);
}