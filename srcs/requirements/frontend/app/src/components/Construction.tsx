import "../styles/construction.css";

import constructionIcon from "../assets/construction.svg";

function Construction()
{
	return (
		<div className="Construction">
			<img className="Construction__Icon" src={ constructionIcon }/>
			<div className="Construction__Text">
				<p>This page is still under construction.</p>
				<p>Please come back later!</p>
			</div>
		</div>
	);
}

export default Construction;