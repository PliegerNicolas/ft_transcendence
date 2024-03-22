import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from "../../App.tsx"

import { MyContext } from '../../utils/contexts.ts';

import OnlineGame  from './OnlinePlay'

import "../../styles/play.css";

// <PrivatePlay /> ====================================================================

const PrivatePlay = () => {
	const location = useLocation();
  	const data = location.state;
	const { me } = useContext(MyContext);
	if (!me || !data) return (<></>);

	const [gameReady, setGameReady] = useState(false);
	const [playerReady, setPlayerReady] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [inviteState, setInviteState] = useState(false);

	const [lobby, setLobby] = useState<string>(data.lobby);
	const [playerNumber, setPlayerNumber] = useState<number>(data.playerNumber);
	const [oppId, setOppId] = useState('');
	const [oppName, setOppName] = useState('');

	const [backgroundColor, setBackgroundColor] = useState('#000');
	const [paddlesColor, setPaddlesColor] = useState('#fff');
	const [ballColor, setBallColor] = useState('#fff');

	const { addNotif } = useContext(MyContext);
	const navigate = useNavigate();

	const destroySocketListeners = () => {
		socket.off('userLeftSocket');
		socket.off('leaveLobby');
		socket.off('changeLobby');
		socket.off('gameReady');
		socket.off('inviteRejected');
		socket.off('inviteAccepted');
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
				}
			});
			socket.on('leaveLobby', () => {
				setPlayerReady(false);
				setLobby('');
			});
			socket.on('changeLobby', (lobby: string, playerNb: number) => {
				setLobby(lobby);
				setPlayerNumber(playerNb);
				setPlayerReady(false);
				//console.log("lobby : " + lobby + " has been changed !");
			});
			socket.on('gameReady', (player1Name: string, player2Name: string, player1ID: string, player2ID: string) => {
				if (playerNumber === 1) {
					setOppName(player2Name);
					setOppId(player2ID);
				}
				if (playerNumber === 2) {
					setOppName(player1Name);
					setOppId(player1ID)
				}
				//console.log(oppName);
				setGameReady(true);
			});
			socket.on('inviteRejected', () => {
				addNotif({content: "Invitation rejected"});
				setInviteState(true);
				setGameOver(true);
			});
			socket.on('inviteAccepted', () => {
				addNotif({type: 1, content: "Invitation accepted"});
				setInviteState(true);
			});
		}
		return () => {
			if (socket)
				destroySocketListeners();
			window.history.replaceState({}, '');
		};
	}, [[]]);

	const readyCheckHandler = () => {
		socket.emit('ready', {lobby: lobby, playerNumber: playerNumber, playerName: me.username});
		//console.log('lobby : ' + lobby + ', playerNumber : ' + playerNumber);
		setPlayerReady(true);
	}

	const notReadyCheckHandler = () => {
		socket.emit('notReady', { lobby: lobby, playerNumber: playerNumber});
		setPlayerReady(false);
	}

	const backToMenuHandler = () => {
		socket.emit('leaveLobby', lobby);
		navigate('/');
	}

	// Backend http requests ==============================================================================================================

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
					{inviteState === false && playerNumber === 1 ? <div>
						<div className="Play__ReadyCheckText">
							<span>Invitation pending</span>
						</div>
					</div> : <div>
					</div>}
					{playerReady === true ? <div>
						<button className="Play__NotReadyButton Play__ButtonAnimation" onClick={notReadyCheckHandler}>Not Ready</button>
					</div> : <div>
						<button className="Play__ReadyButton Play__ButtonAnimation" onClick={readyCheckHandler}>Ready</button>
					</div>}
				</div> }
			{gameReady === true ? <div></div> : <div>
				<span className="Play__Instructions">Use W/S or 🔼/🔽 to control your paddle</span>
			</div>}
		</div>
		</main>
	);
}

export default PrivatePlay;