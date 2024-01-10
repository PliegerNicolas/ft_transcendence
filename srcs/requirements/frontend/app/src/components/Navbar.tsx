import {Link} from "react-router-dom";

function Navbar({current, setCurrent}: {current: number, setCurrent: Function})
{
	//const options = ["Home", "Play", "Stats", "Chat", "Settings", "About"];
	const options = [
		{ name: "Home", path: "/" },
		{ name: "Play",	path: "/play" },
		{ name: "Stats", path: "/stats" },
		{ name: "Chat", path: "/chat" },
		{ name: "Settings", path: "/settings" },
		{ name: "About", path: "/about" },
		{ name: "API Sandbox", path: "/apisandbox" }
	];

	const navHtml = options.map((elem, index) =>
		<Link to={elem.path} key={index} className="Navbar__Link">
			<button
				key={index}
				className={"Navbar__Button" + (index === current ? "--Current" : "")}
				onClick={() => {setCurrent(index);}}
			>
				{elem.name}
			</button>
		</Link>
	);

	return (<nav className="Navbar"> {navHtml} </nav>);
}

export default Navbar;