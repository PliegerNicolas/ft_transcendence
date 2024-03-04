import { useContext, useEffect, useState } from 'react';
import { socket } from "../../App.tsx"
import { MyContext } from '../../utils/contexts';
import { useQuery } from '@tanstack/react-query';
import { useStopOnHttp } from '../../utils/utils';

import OnlineGame  from './OnlinePlay'

import "../../styles/play.css";

// <Play /> ====================================================================

function Play() {
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


	const destroySocketListeners = () => {
		socket.off('userJoinedSocket');
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
			socket.on('userJoinedSocket', (newUserId: string) => {
				console.log('New user connected:', newUserId);
			});
			socket.on('userLeftSocket', (userId: string) => {
				console.log('User disconnected:', userId);
				if (userId === oppId) {
					console.log('opponent left lobby');
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
				console.log('lobby : ' + lobby_id + ' joined');
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
				console.log(oppName);
				setGameReady(true);
			});
		}
		return () => {
			if (socket)
				destroySocketListeners();
		};
	}, [[]]);

	const readyCheckHandler = () => {
		if (playerNumber === 1)
			socket.emit('ready', {lobby: lobby, playerNumber: playerNumber, playerName: getUser.data.username});
		else if (playerNumber === 2)
			socket.emit('ready', {lobby: lobby, playerNumber: playerNumber, playerName: 'Maëvo'});
		setPlayerReady(true);
	}

	const notReadyCheckHandler = () => {
		socket.emit('notReady', { lobby: lobby, playerNumber: playerNumber});
		setPlayerReady(false);
	}

	const joinQueueHandler = () => {
		setInQueue(true);
		socket.emit('joinQueue');
		console.log('joinedQueue');
	}

	const leaveQueueHandler = () => {
		setInQueue(false);
		socket.emit('leaveQueue');
	}

	const backToMenuHandler = () => {
		setInQueue(false);
		setPlayerReady(false);
		setGameReady(false);
		setGameOver(false);
		socket.emit('leaveLobby', lobby);
		setLobby('');
	}

	// Backend http requests ==============================================================================================================

	const context = useContext(MyContext);

	const getUser = useQuery({
		queryKey: ["user"],
		queryFn: () => context.api.get("/me"),
		retry: useStopOnHttp(),
	});

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
			</div>}
		</div>
		</main>
	);
}

export default Play;