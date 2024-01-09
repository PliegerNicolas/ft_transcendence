import React from "react";

function Navbar()
{
	const [current, setCurrent] = React.useState(0);

	return (
		<nav className="Navbar">
			<button
				className={ "Navbar__Button" + (current === 0 ? "--Current" : "") }
				onClick={ () => { setCurrent(0); } }
			>
				Home
			</button>
			<button
				className={ "Navbar__Button" + (current === 1 ? "--Current" : "") }
				onClick={ () => { setCurrent(1); } }
			>
				Play
			</button>
			<button
				className={ "Navbar__Button" + (current === 2 ? "--Current" : "") }
				onClick={ () => { setCurrent(2); } }
			>
				Stats
			</button>
			<button
				className={ "Navbar__Button" + (current === 3 ? "--Current" : "") }
				onClick={ () => { setCurrent(3); } }
			>
				Chat
			</button>
			<button
				className={ "Navbar__Button" + (current === 4 ? "--Current" : "") }
				onClick={ () => { setCurrent(4); } }
			>
				Settings
			</button>
			<button
				className={ "Navbar__Button" + (current === 5 ? "--Current" : "") }
				onClick={ () => { setCurrent(5); } }
			>
				About
			</button>
		</nav>
	);
}

export default Navbar;