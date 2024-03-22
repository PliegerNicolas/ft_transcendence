import { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";
import defaultPicture from "../assets/default_profile.png";
import logoutIcon from "../assets/logout.svg";

import UserSuggestions from "./UserSuggestions.tsx";
import Login from "./Login.tsx";

import { MyContext } from "../utils/contexts.ts";
import { useGet, useSetMe } from "../utils/hooks.ts";
import { socket } from "../App.tsx";

function useOutsideClick(callback: (event: MouseEvent) => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export default function Header()
{
	const { logged, setGlobalPopup, me } = useContext(MyContext);

	const [ popup, setPopup ] = useState(false);

	const getPic = useGet(["picture"], logged);

	const popupRef = useOutsideClick(() => {
			setTimeout(() => setPopup(false), 0);
	});

	const [logAsUsername, setLogAsUsername] = useState("");

	const setMe = useSetMe();

	function setLogAsPopup(value: string) {
		setGlobalPopup({
			title: "Log as another user",
			text:
				<>
					/!\ This is a debug feature <br />
					Please don't do anything dumb using it.<br /><br />
					<div style={{textAlign: "center"}}>
						<input
							type="text"
							list="UserSuggestions"
							value={value}
							onChange={handleUsernameChange}
						/>
						<UserSuggestions />
					</div>
				</>,
			action: "Done",
			cancelFt: () => {},
			actionFt: () => {
				setMe(logAsUsername);
				setGlobalPopup(null);
			}
		});
	}

	function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
		setLogAsUsername(e.target.value);
		setLogAsPopup(e.target.value);
	}

	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Pong</span>
				</div>
			</Link>
			<div
				ref={popupRef}
				className="Header__Right"
				onClick={() => setPopup(prev => !prev)}
			>
			<div className="Header__Username">
				{me ? me.username : "Guest"}
			</div>
			{
				me ?
				<div className="Header__UserInfo">
					<div className="Header__UserInfoContainer">
						<img
							src={getPic.data || defaultPicture}
						/>
					</div>
					{
						popup &&
						<div className="Header__Popup">
							<Link to="/user/me" className="Header__PopupLink logged">
								<img src={getPic.data || defaultPicture}/>
								<div className="Header__PopupUsername">
									{me.username}
								</div>
							</Link>
							<hr />
							<Link to="/user/me" className="Header__PopupLink logged">
								My profile
							</Link>
							<Logout />
							{
								me?.globalServerPrivileges === "operator" &&
								<div
									className="Login Logout Header__LogAs"
									onClick={() => setLogAsPopup("")}
								>
									Log as
								</div>
							}
						</div>
					}
				</div> :
				<div className="Header__UserInfo">
					<div className="Header__UserInfoContainer" >
						<img
							src={defaultPicture}
						/>
					</div>
					{
						popup &&
						<div className="Header__Popup">
							<div className="Header__PopupLink">
								<img src={defaultPicture}/>
								<div className="Header__PopupUsername">
									Guest
								</div>
							</div>
							<hr />
							<Login />
						</div>
					}
				</div>
			}
			</div>
		</header>
	);
}

function Logout()
{
	const { setLogged, api } = useContext(MyContext);

	const backendLogout = useMutation({
		mutationFn: () => api.post("/auth/logout", {}),
		onSuccess: () => window.location.reload(),
	});

	function logoutNow() {
		setLogged(false);
		socket.emit('logOut');
		backendLogout.mutate();
	}

	return (
		<div
			onClick={() => logoutNow()}
			className="Login Logout"
		>
			Log out
			<img src={logoutIcon} />
		</div>
	);
}