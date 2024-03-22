import "../styles/construction.css";

import constructionIcon from "../assets/construction.svg";

function Construction()
{
	return (
		<div className="Construction">
			<img className="Construction__Icon" src={ constructionIcon }/>
			<div className="Construction__Text">
				<div>This page is still under construction.</div>
				<div>Please come back later!</div>
			</div>
		</div>
	);
}

export default Construction;