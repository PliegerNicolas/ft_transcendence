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

	const backHandler = () => {
		setGameMode(Mode.NONE);
	}

	return (
		<main className="MainContent">
        		{ gameMode === Mode.NONE ? <div className='Gamemode-Selectors'>
        			<button onClick={localHandler}>Local mode</button>
					<button onClick={onlineHandler}>Online mode</button></div> : <div></div>}
				{ gameMode === Mode.LOCAL ? <div className='Gamemode-Local'>
					<LocalGame/>
					<button onClick={backHandler}>Back</button></div> : <div></div>}
				{ gameMode === Mode.ONLINE ? <div className='Gamemode-Online'>
						<OnlineGame />
						<button onClick={backHandler}>Back</button></div> : <div></div>}
			
		</main>
	);
}

export default Play;