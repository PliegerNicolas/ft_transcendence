import { Link } from "react-router-dom";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";

import Login from "./Login.tsx";

function Header()
{
	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Pong</span>
				</div>
			</Link>
			<Login />
		</header>
	);
}

export default Header;