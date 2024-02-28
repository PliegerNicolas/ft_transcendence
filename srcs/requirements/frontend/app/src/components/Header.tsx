import { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import "../styles/header.css";

import ft_logo from "../assets/42.svg";
import defaultPicture from "../assets/default_profile.png";
import logoutIcon from "../assets/logout.svg";

import Login from "./Login.tsx";
import Spinner from "./Spinner.tsx";

import { MyContext } from "../utils/contexts.ts";
import { useStopOnHttp } from "../utils/utils.ts";

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
	const { logged, api } = useContext(MyContext);
	const stopOnHttp = useStopOnHttp();

	const [ popup, setPopup ] = useState(false);

	const getMe = useQuery({
		queryKey: ["me"],
		queryFn: () => api.get("/me"),
		enabled: api.auth,
		retry: stopOnHttp,
	});

	const popupRef = useOutsideClick(() => {
			setTimeout(() => setPopup(false), 0);
	});

	return (
		<header className="Header">
			<Link to="/">
				<div className="Header__Title">
					<img className="Header__Logo" src={ft_logo} />
					<span className="Header__TitleText">Pong</span>
				</div>
			</Link>
			{
				logged ?
				<div className="Header__UserInfo">
					<div className="Header__UserInfoContainer" ref={popupRef}>
						<img
							src={defaultPicture}
							onClick={() => setPopup(prev => !prev)}
						/>
					</div>
					{
						popup &&
						<div className="Header__Popup">
						{
							getMe.isSuccess &&
							<>
								<Link to="/user/me" className="Header__PopupLink logged">
									<img src={defaultPicture}/>
									<div className="Header__PopupUsername">
										{getMe.data.username}
									</div>
								</Link>
								<hr />
								<Link to="/user/me" className="Header__PopupLink logged">
									My profile
								</Link>
								<Logout />
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
					<div className="Header__UserInfoContainer" ref={popupRef}>
						<img
							src={defaultPicture}
							onClick={() => setPopup(prev => !prev)}
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
		</header>
	);
}

function Logout()
{
	const { setLogInfo } = useContext(MyContext);

	function logoutNow() {
		localStorage.removeItem("my_info");
		setLogInfo({logged: false, token: ""});
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