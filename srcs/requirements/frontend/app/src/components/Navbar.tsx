import {useLocation, Link} from "react-router-dom";

function Navbar()
{
	const options = [
		{ name: "Home", path: "/" },
		{ name: "Play",	path: "/play" },
		{ name: "Stats", path: "/stats" },
		{ name: "Chat", path: "/chat" },
		{ name: "Settings", path: "/settings" },
		{ name: "About", path: "/about" },
		{ name: "API Sandbox", path: "/apisandbox" }
	];
	let loc = useLocation();

	const navHtml = options.map((elem, index) =>
		<Link to={elem.path} key={index} 
			className={
				"Navbar__Link " +
				"Navbar__Button" + ( elem.path === loc.pathname ? "--Current" : "")
			}
		>
			{elem.name}
		</Link>
	);

	return (<nav className="Navbar"> {navHtml} </nav>);
}

export default Navbar;