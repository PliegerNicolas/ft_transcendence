import { useGet } from "../../utils/hooks";
import { GameResult, GamelogsType, User } from "../../utils/types";

// <Stats /> ====================================================================

export default function Stats({username}: {username: string}) {
	const getUser = useGet(["users", username]);
	const user = getUser.data;

	const getLogs = useGet(["users", username, "gamelogs"]);
	if (!getLogs.isSuccess || !getUser.isSuccess) {
		return (
			<div className="Stats">
				<div className="Stats__Error">Couldn't get stats</div>
			</div>
		)
	}

	const getWinrate = () => {
		if ((getLogs.data.userResultsCount.victory + getLogs.data.userResultsCount.defeat) === 0)
			return (0);
		else
			return ((getLogs.data.userResultsCount.victory / (getLogs.data.userResultsCount.victory + getLogs.data.userResultsCount.defeat)) * 100);
	}

	return (
		<div className="Stats">
			<div className="Stats__elo">{user.profile.elo} elo</div>
			<div className="Stats__winrate">{getLogs.data.userResultsCount.victory}V / {getLogs.data.userResultsCount.defeat}D | Winrate {getWinrate()}%</div>
			<h4 className="Stats__historic">Match history :</h4>
			{
				getLogs.data.userResultsCount.victory + getLogs.data.userResultsCount.defeat === 0 ? 
				<div className="Stats__noHistoric">No games played :(</div> :
				getLogs.data.gamelogs.map((item: GamelogsType, index: number) =>
					<Historic 
						key={index}
						infos={item}
						user={user}
					/>)
			}
		</div>
	)
}

function Historic({infos, user}: {infos: GamelogsType, user: User}) {
	if (!user) {
		return (<div className="Historic__Error">Couldn't get historic</div>)
	}

	const getGameResult = () => {
		if (infos.gamelogToUsers[0] && infos.gamelogToUsers[0].user.id === user.id) {
			if (infos.gamelogToUsers[0].result == GameResult.VICTORY)
				return (<div className="Historic__Victory">VICTORY</div>);
			else
				return (<div className="Historic__Defeat">DEFEAT</div>);
		}
		else if (infos.gamelogToUsers[1] && infos.gamelogToUsers[1].user.id === user.id) {
			if (infos.gamelogToUsers[1].result == GameResult.VICTORY)
				return (<div className="Historic__Victory">VICTORY</div>);
			else
				return (<div className="Historic__Defeat">DEFEAT</div>);
		}
	}

	const getOpponentName = () => {
		if (infos.gamelogToUsers[1] && infos.gamelogToUsers[0]) {
			if (infos.gamelogToUsers[0].user.id === user.id)
				return (<div className="Historic__Opponent"> against {infos.gamelogToUsers[1].user.username}</div>);
			else if (infos.gamelogToUsers[1].user.id === user.id)
				return (<div className="Historic__Opponent"> against {infos.gamelogToUsers[0].user.username}</div>);
		}		
		else
			return (<div className="Historic__Opponent"> against [deleted user]</div>);
	}

	return (
		<p className="Historic">
			{getGameResult()}
			{getOpponentName()}
		</p>
	)
}