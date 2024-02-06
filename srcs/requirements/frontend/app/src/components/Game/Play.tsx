import { useState, useEffect } from "react";
import { io } from 'socket.io-client';

import LocalGame  from './LocalPlay'
import OnlineGame  from './OnlinePlay'

import "../../styles/play.css";

// <Play /> ====================================================================

enum Mode {
	NONE,
	LOCAL,
	ONLINE
}

export const socket = io(`http://${location.hostname}:3450/game`);

function Play() {
	const [gameMode, setGameMode] = useState<Mode>(Mode.NONE);
	const [user, setUser] = useState<string>();
	const [lobby, setLobby] = useState<string>('');

	const socketManagement = () => {
	socket.on('connect', () => {
		console.log('Connected');
	});
	socket.on('userJoinedLobby', (newUserId: string) => {
		console.log('New user connected:', newUserId);
		setUser(newUserId);
	});
	socket.on('userLeftLobby', (disconnectedUserId: string) => {
		console.log('User disconnected:', disconnectedUserId);
		setUser('');
	});

	socket.on('joinedLobby', (lobby_id: string) => {
		console.log('Lobby joined');
		setLobby(lobby_id);
	});

	return () => {
		socket.off('connect');
		socket.off('userJoinedLobby');
		socket.off('userLeftLobby');
		socket.off('joinedLobby');
		console.log('Unregistering Events');
	}
}

	const localHandler = () => {
		setGameMode(Mode.LOCAL);
	}

	const onlineHandler = () => {
		setGameMode(Mode.ONLINE);
	}

	const backHandler = () => {
		setGameMode(Mode.NONE);
	}

	const lobbyCreateHandler = () => {
		socket.emit('createLobby', 'lobby1_id');
		setLobby('lobby1');
	}

	const lobbyJoinHandler = () => {
		socket.emit('joinLobby', 'lobby1_id');
		setLobby('lobby1');
	}

	useEffect(() => {
		if (gameMode === Mode.ONLINE)
			socketManagement();
	}, [[]]);

	return (
		<main className="MainContent">
        		{ gameMode === Mode.NONE ? <div className='Gamemode-Selectors'>
        			<button onClick={localHandler}>Local mode</button>
					<button onClick={onlineHandler}>Online mode</button></div> : <div></div>}
				{ gameMode === Mode.LOCAL ? <div className='Gamemode-Local'>
					<LocalGame/>
					<button onClick={backHandler}>Back</button></div> : <div></div>}
				{ gameMode === Mode.ONLINE ? <div>
					{ lobby.length === 0 ? <div className='Gamemode-Lobbycreation'>
						<button onClick={lobbyCreateHandler}>Create Lobby</button>
						<button onClick={lobbyJoinHandler}>Join Lobby</button>
					</div> : <div className='Gamemode-Online'>
							<OnlineGame socket={socket} opponent_name={user || "Player 2"} />
						</div> }
					<button onClick={backHandler}>Back</button></div> : <div></div>}
			
		</main>
	);
}

export default Play;