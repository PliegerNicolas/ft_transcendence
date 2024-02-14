import { useState } from "react";

import LocalGame  from './LocalPlay'
import OnlineGame  from './OnlinePlay'

import "../../styles/play.css";

// <Play /> ====================================================================

enum Mode {
	NONE,
	LOCAL,
	ONLINE
}


function Play() {
	const [gameMode, setGameMode] = useState<Mode>(Mode.NONE);

	const localHandler = () => {
		setGameMode(Mode.LOCAL);
	}

	const onlineHandler = () => {
		setGameMode(Mode.ONLINE);
	}

	return (
		<main className="MainContent">
        		{ gameMode === Mode.NONE ? <div className='Gamemode-Selectors'>
        			<button className='Gamemode-button' onClick={localHandler}>Local</button>
					<button className='Gamemode-button' onClick={onlineHandler}>Online</button></div> : <div></div>}
				{ gameMode === Mode.LOCAL ? <div className='Gamemode-Local'>
					<LocalGame/> </div> : <div></div>}
				{ gameMode === Mode.ONLINE ? <div className='Gamemode-Online'>
					<OnlineGame /> </div>: <div></div>}
			
		</main>
	);
}

export default Play;