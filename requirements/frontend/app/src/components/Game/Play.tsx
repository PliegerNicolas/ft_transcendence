import { useContext, useEffect, useState } from 'react';
import { socket } from "../../App.tsx"

import OnlineGame  from './OnlinePlay'

import "../../styles/play.css";
import { MyContext } from '../../utils/contexts.ts';
import { useNavigate, Link } from 'react-router-dom';
import { useGet } from '../../utils/hooks.ts';
import { UserType } from '../../utils/types.ts';

// <Play /> ====================================================================

function Play()
{
	const { me } = useContext(MyContext);
	if (!me) return (<></>);

	const [inQueue, setInQueue] = useState(false);
	const [gameReady, setGameReady] = useState(false);
	const [playerReady, setPlayerReady] = useState(false);
	const [gameOver, setGameOver] = useState(false);

	const [lobby, setLobby] = useState<string>('');
	const [playerNumber, setPlayerNumber] = useState(1);
	const [oppId, setOppId] = useState('');

	const [oppName, setOppName] = useState('');

	const [backgroundColor, setBackgroundColor] = useState('#000');
	const [paddlesColor, setPaddlesColor] = useState('#fff');
	const [ballColor, setBallColor] = useState('#fff');

	const navigate = useNavigate();

	const destroySocketListeners = () => {
		socket.off('userLeftSocket');
		socket.off('leaveLobby');
		socket.off('gameFound');
		socket.off('gameReady');
	}

	const handlegameOverChange = (data: boolean) => {
		setGameOver(data);
	};

	useEffect(() => {
		if (socket) {
			socket.on('userLeftSocket', (userId: string) => {
				//console.log('User disconnected:', userId);
				if (userId === oppId) {
					//console.log('opponent left lobby');
					socket.emit('opponentLeft', {userId, lobby});
					setOppId('');
					if (gameOver === true) {
						setLobby('');
						setGameReady(false);
					}
				}
			});
			socket.on('leaveLobby', () => {
				setPlayerReady(false);
				setInQueue(false);
				setLobby('');
			});
			socket.on('gameFound', (player_number: number, lobby_id: string, opp_id: string) => {
				//console.log('lobby : ' + lobby_id + ' joined');
				setLobby(lobby_id);
				setPlayerNumber(player_number);
				setOppId(opp_id);
				setInQueue(false);
			});
			socket.on('gameReady', (player1Name: string, player2Name: string, player1ID: string, player2ID: string) => {
				if (playerNumber === 1) {
					setOppName(player2Name);
					if (!oppId)
						setOppId(player2ID);
				}
				if (playerNumber === 2) {
					setOppName(player1Name);
					if (!oppId)
						setOppId(player1ID)
				}
				//console.log(oppName);
				setGameReady(true);
			});
		}
		return () => {
			if (socket)
				destroySocketListeners();
		};
	}, [[]]);

	const readyCheckHandler = () => {
		socket.emit('ready', {lobby: lobby, playerNumber: playerNumber, playerName: me.username});
		setPlayerReady(true);
	}

	const notReadyCheckHandler = () => {
		socket.emit('notReady', { lobby: lobby, playerNumber: playerNumber});
		setPlayerReady(false);
	}

	const joinQueueHandler = () => {
		setInQueue(true);
		socket.emit('joinQueue');
		//console.log('joinedQueue');
	}

	const leaveQueueHandler = () => {
		setInQueue(false);
		socket.emit('leaveQueue');
	}

	const backToMenuHandler = () => {
		socket.emit('leaveLobby', lobby);
		navigate('/');
	}

	return (
		<main className="MainContent">
			<div>
			{gameReady === true ? <div>
			</div> : <section className="Play__SelectorSection">
				<h3>Customize your game</h3>
				<div className="Play__Selectors">
					<div className="Play__PaddleSelector">
						<span className="Play__CustomName">Paddle</span>
						<select id="PaddleSelect"  onChange={(e) => setPaddlesColor(e.target.value)}>
							<option value="#fff">default</option>
    						<option value="#cc0000">red</option>
    						<option value="#2eb82e">green</option>
    						<option value="#008ae6">blue</option>
   						</select>
					</div>
					<div className="Play__BackgroundSelector">
						<span>Background</span>
						<select id="BackgroundSelect" onChange={(e) => setBackgroundColor(e.target.value)}>
							<option value="#000">default</option>
    						<option value="#cc0000">red</option>
    						<option value="#2eb82e">green</option>
    						<option value="#008ae6">blue</option>
   						</select>
					</div>
					<div className="Play__BallSelector">
						<span>Ball</span>
						<select id="BallSelect" onChange={(e) => setBallColor(e.target.value)}>
							<option value="#fff">default</option>
    						<option value="#cc0000">red</option>
    						<option value="#2eb82e">green</option>
    						<option value="#008ae6">blue</option>
   						</select>
					</div>
				</div>
			</section>}
			{lobby.length === 0 ? <div>
				{inQueue === true ? <div>
					<span className="Play__InQueueText">In Queue</span>
					<div className="Play__Ellipsis">
  						<div className="Play__Dot" style={{ '--dot-index': 1 } as React.CSSProperties}></div>
  						<div className="Play__Dot" style={{ '--dot-index': 2 } as React.CSSProperties}></div>
  						<div className="Play__Dot" style={{ '--dot-index': 3 } as React.CSSProperties}></div>
					</div>
					<button className="Play__LeaveQueueButton Play__ButtonAnimation" onClick={leaveQueueHandler}>Leave Queue</button>
				</div> : <div>
					<button className="Play__JoinQueueButton Play__ButtonAnimation" onClick={joinQueueHandler}>Join Queue</button>
				</div> }
			</div> : <div>
				{gameReady === true ? <div>
						<OnlineGame 
						lobby={lobby}
						gameOver={gameOver}
						oppId={oppId}
						oppName={oppName}
						playerNumber={playerNumber}
						backgroundColor={backgroundColor}
						paddlesColor={paddlesColor}
						ballColor={ballColor}

						onDataChange={handlegameOverChange}
					 />
					{gameOver === true ? <div>
						<button className="Play__BackToMenu" onClick={backToMenuHandler}>Back to Menu</button>
					</div> : <div></div>}
				</div> : <div>
					<div className="Play__ReadyCheckText">
						<span>You have found an opponent !</span>
					</div>
					{playerReady === true ? <div>
						<button className="Play__NotReadyButton Play__ButtonAnimation" onClick={notReadyCheckHandler}>Not Ready</button>
					</div> : <div>
						<button className="Play__ReadyButton Play__ButtonAnimation" onClick={readyCheckHandler}>Ready</button>
					</div>}
				</div> }
			</div> }
			{gameReady === true ? <div></div> : <div>
				<span className="Play__Instructions">Use W/S or 🔼/🔽 to control your paddle</span>
				<div className="Ladder__Container">
					<Ladder />
				</div>
			</div>}
		</div>
		</main>
	);
}

function Ladder() {
	const getUsers = useGet(["users"]);
	if (!getUsers.isSuccess) {
		return (
			<div className="Ladder__Element">
				<div className="Ladder__Error">Couldn't get ladder</div>
			</div>
		)
	}

	return (
		<div className="Ladder__List">
			<div className="Ladder__Title Ladder__ListHead">Ladder</div>
			{
				getUsers.data
					.sort((a: UserType, b: UserType) => b.profile.elo - a.profile.elo)
					.map((user: UserType, index: number) =>
						<LadderItem user={user} index={index} key={user.id} />
				)
			}
		</div>
	);
}

function LadderItem({user, index}: {user: UserType, index: number})
{
	const getPic = useGet(["users", user.username, "picture"]);

	return (
		<div className="Ladder__Item">
			<div className="Ladder__Index">#{index + 1} {index + 1 === 1 ? <>🏆</> : <></>}</div>
			<div className="Ladder__Username">
				<img src={getPic.data} />
				<Link to={"/user/" + user.username}>
					<span>{user.username}</span>
				</Link>
			</div>
			<div className="Ladder__Elo">{user.profile.elo}</div>
		</div>
	);
}

export default Play;