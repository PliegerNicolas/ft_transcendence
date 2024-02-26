import { useNavigate } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { socket } from './Play';
import { useContext, useEffect } from "react";
import { InviteType } from "../../utils/types";
import { MyContext } from "../../utils/contexts";

export const InvitePlayer = (props: any) => {

	const navigate = useNavigate();

	const lobby_id = uuid();

	const toPrivatePlay=()=>{
  		navigate('/play/private',{state:{
			lobby: lobby_id,
			playerNumber: 1,
		}});
		if (socket) {
			socket.emit('inviteToPrivate', lobby_id, props.user);
		}
	}

	return (
		<div>
			<div><a onClick={()=>{toPrivatePlay()}}>Invite to play</a></div>
		</div>
	);
}

export default function Invitations(
	{list, setList}:
	{list: InviteType[], setList: Function}
)
{
	const context = useContext(MyContext);

	function rmInvite(lobby: string) {
		setList((prev: {from: string, lobby: string}[]) =>
			prev.filter(invite => invite.lobby !== lobby));
	}

	useEffect(() => {
		if (socket) {
			socket.on('invitedToPrivate', (user: string, lobby: string) => {
			context.addInvite({from: user, lobby: lobby});
			});
		}
		return () => {
			if (socket)
				socket.off('invitedToPrivate');
		};
	}, [[]]);

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
		socket.emit('acceptInvite', invite.from, invite.lobby);
		navigate('/play/private',{state:{
			lobby: invite.lobby,
			playerNumber: 2,
		}});
		rmSelf();
	}

	const rejectHandler = () => {
		socket.emit('rejectInvite', invite.from, invite.lobby);
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