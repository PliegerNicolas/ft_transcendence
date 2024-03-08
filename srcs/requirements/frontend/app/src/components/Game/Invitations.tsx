import { useNavigate } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { socket } from "../../App.tsx"
import { InviteType } from "../../utils/types";

export const InvitePlayer = (props: any) => {

	const navigate = useNavigate();

	const lobby_id = uuid();

	const toPrivatePlay=()=>{
		const data = { lobby: lobby_id, playerNumber: 1, };
		navigate('/play/private',{state: data});
		if (socket) {
			socket.emit('inviteToPrivate', {user: props.user, lobby: lobby_id});
		}
	}

	return (
		<div>
			<div><button onClick={()=>{toPrivatePlay()}}>Invite to play</button></div>
		</div>
	);
}

export default function Invitations(
	{list, setList}:
	{list: InviteType[], setList: Function}
)
{
	function rmInvite(lobby: string) {
		setList((prev: {from: string, lobby: string}[]) =>
			prev.filter(invite => invite.lobby !== lobby));
	}

	return (
		<div className="Invites">
		{
			list.map((invite, index) =>
				<div key={invite.lobby} style={{
					opacity: "" + (1 - .33 * ((list.length - 3) - index)),
					display: (index < list.length - 5) ? "none" : "auto"
				}}>
				<Invite
					invite={invite}
					rmSelf={() => rmInvite(invite.lobby)}
				/>
				</div>
			)
		}
		</div>
	);
}

function Invite(
	{invite, rmSelf}:
	{invite: InviteType, rmSelf: Function}
)
{
	const navigate = useNavigate();

	const acceptHandler = () => {
		const data = { lobby: invite.lobby, playerNumber: 2, };
		socket.emit('acceptInvite', {user: invite.from, lobby: invite.lobby});
		navigate('/play/private',{state: data});
		rmSelf();
	}

	const rejectHandler = () => {
		socket.emit('rejectInvite', {user: invite.from, lobby: invite.lobby});
		rmSelf();
	}

	return (
		<div className={`Invites__Invite`}>
			<div>
				<div>{invite.from} invited you.</div>
				<button onClick={() => acceptHandler()}>Accept</button>
				<button onClick={() => rejectHandler()}>Reject</button>
			</div>
		</div>
		);
}