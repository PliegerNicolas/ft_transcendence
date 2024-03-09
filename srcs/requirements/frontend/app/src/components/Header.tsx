import { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";
import defaultPicture from "../assets/default_profile.png";
import logoutIcon from "../assets/logout.svg";

import Login from "./Login.tsx";
import Spinner from "./Spinner.tsx";

import { MyContext } from "../utils/contexts.ts";
import { useGet } from "../utils/hooks.ts";

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
	const { logged, api, setGlobalPopup, addNotif } = useContext(MyContext);

	const [ popup, setPopup ] = useState(false);

	const getMe = useGet(["me"], logged && api.auth);
	const getPic = useGet(["picture"], logged && api.auth);

	const popupRef = useOutsideClick(() => {
			setTimeout(() => setPopup(false), 0);
	});

	const [logAsUsername, setLogAsUsername] = useState("");

	const setMe = useMutation({
		mutationFn: (() =>
			api.post("/auth/log_as/" + logAsUsername, {})) as unknown as
			MutationFunction<{ access_token: string; }, unknown>,
		onSuccess: (data: {access_token: string}) => {
			localStorage.setItem(
				"my_info", JSON.stringify({logged: true, token: data.access_token}));
			window.location.reload();
		},
		onError: e => addNotif({content: "Failed to log as: " + logAsUsername +
		", " + e.message}),
	});

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
							value={value}
							onChange={handleUsernameChange}
						/>
					</div>
				</>,
			action: "Done",
			cancelFt: () => {},
			actionFt: () => {
				setMe.mutate(logAsUsername);
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
				{logged && getMe.isSuccess ? getMe.data.username : "Guest"}
			</div>
			{
				logged ?
				<div className="Header__UserInfo">
					<div className="Header__UserInfoContainer">
						<img
							src={getPic.data || defaultPicture}
						/>
					</div>
					{
						popup &&
						<div className="Header__Popup">
						{
							getMe.isSuccess &&
							<>
								<Link to="/user/me" className="Header__PopupLink logged">
									<img src={getMe.data.picture || defaultPicture}/>
									<div className="Header__PopupUsername">
										{getMe.data.username}
									</div>
								</Link>
								<hr />
								<Link to="/user/me" className="Header__PopupLink logged">
									My profile
								</Link>
								<Logout />
								<div
									className="Login Logout Header__LogAs"
									onClick={() => setLogAsPopup("")}
								>
									Log as
								</div>
							</>
							|| getMe.isPending &&
							<Spinner />
							|| getMe.isError &&
							<span className="error-msg">
								Failed to get user info: {getMe.error.message}
							</span>
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
	const { setLogInfo, api } = useContext(MyContext);

	const backendLogout = useMutation({
		mutationFn: () => api.post("/auth/logout", {}),
	});

	function logoutNow() {
		localStorage.removeItem("my_info");
		setLogInfo({logged: false, token: ""});
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