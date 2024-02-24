import {useLocation, Link} from "react-router-dom";

import "../styles/navbar.css";

import homeIcon from "../assets/home.svg";
import playIcon from "../assets/play.svg";
import statsIcon from "../assets/stats.svg";
import chatIcon from "../assets/chat.svg";
import settingsIcon from "../assets/settings.svg";
import aboutIcon from "../assets/about.svg";
import sandboxIcon from "../assets/sandbox.svg";

import { useContext } from "react";
import { MyContext } from "../utils/contexts";

function firstPathSegment(fullPath: string)
{
	const pathArray = fullPath.match(/^\/[^/]*/);
	return (pathArray?.length ? pathArray[0] : "");
}

function Navbar()
{
	const { lastChan } = useContext(MyContext);
	const options = [
		{ name: "Home", path: "/", img: homeIcon },
		{ name: "Play",	path: "/play", img: playIcon },
		{ name: "Stats", path: "/stats", img: statsIcon },
		{ name: "Chat", path: "/chat/" + lastChan, img: chatIcon },
		{ name: "Settings", path: "/settings", img: settingsIcon },
		{ name: "About", path: "/about", img: aboutIcon },
		{ name: "Sandbox", path: "/sandbox", img: sandboxIcon }
	];
	const loc = useLocation();
	const path = firstPathSegment(loc.pathname);

	const navHtml = options.map((elem, index) =>
		<Link to={elem.path} key={index} className={
			`Navbar__Link Navbar__Button${
				firstPathSegment(elem.path) === path ? "--Curr" : ""
			}`
		}>
			<img src={elem.img}/>
			<div className="Navbar__Text">
				{elem.name}
			</div>
		</Link>
	);

	return (
		<nav className="Navbar">
			{navHtml}
		</nav>
	);
}

export default Navbar;