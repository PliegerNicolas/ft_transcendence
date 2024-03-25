import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";

import { MyContext } from "../utils/contexts";
import { useInvalidate, useMutateError } from "../utils/hooks";
import { httpStatus } from "../utils/utils";

import ConfirmPopup from "./ConfirmPopup";
import Spinner from "./Spinner";

import check from "../assets/check.svg";
import { socket } from "../App";
import { useNavigate } from "react-router-dom";

export default function Settings()
{
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current?.scrollTo(0, 0);
	}, []);

	return (
		<main className="MainContent" ref={ref}>
			<h2>Settings</h2>
			<Setup2fa reference={ref} />
		</main>
	);
}

// <Setup2fa /> ================================================================

function Setup2fa({reference}: {reference: React.RefObject<HTMLDivElement>})
{
	const { api, addNotif, me } = useContext(MyContext);

	const mutateError = useMutateError();
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const generate2fa = useMutation({
		mutationFn: () => api.post("/2fa/generate", {}),
		onError: mutateError,
	});

	const turnOn2fa = useMutation({
		mutationFn: (code: string) =>
			api.post("/2fa/turn-on", {twoFactorAuthCode : code}),
		onError: (error) => {
			if (httpStatus(error) === 403)
				addNotif({type: 1, content: "Failed to enable 2FA, is the code correct?"});
			else
				mutateError(error);
		},
		onSuccess: () => {
			setPopup2fa(false);
			location.reload();
		},
	});

	const turnOff2fa = useMutation({
		mutationFn: () => api.post("/2fa/turn-off", {}),
		onError: mutateError,
		onSuccess: () => {
			location.reload(),
			setPopup2fa(false);
			location.reload();
		},
	});

	const backendLogout = useMutation({
		mutationFn: () => api.post("/auth/logout", {}),
		onSuccess: () => window.location.reload(),
	});

	const delMe = useMutation({
		mutationFn: () => api.delete("/me"),
		onSettled: () => invalidate(["me"])
	});

	const [code, setCode] = useState("");
	const [popup2fa, setPopup2fa] = useState(false);
	const [popupDel, setPopupDel] = useState(false);

	if (!me) return (
		<section>
			<h3>Setup 2fa</h3>
			<div className="notice-msg">Waiting for your user data...</div>
			<Spinner />
		</section>
	);

	return (
		<>
		<section>
			<h3>Setup 2FA</h3>
			{
				me.isTwoFactorAuthEnabled ?
				<>
					<div className="Setup2fa__Status">
						<>2FA is enabled for your account</> <img src={check} />
					</div>
					<button onClick={() => turnOff2fa.mutate()}>
						Disable 2FA?
					</button>
				</> :
				<>
					<div className="Setup2fa__Info notice-msg">
						Two-factor authentication (2FA) allows you to enforce a double layer
						of protection when logging in to this website. When connecting, a
						code will be requested from a third-party app to confirm your
						identity.<br /><br />
						To setup 2FA, you will need to flash a QR code using an
						authentication app such as Google Authenticator or Authy. You will
						then have to input the provided code to confirm your anthenticator
						app.
					</div>
					<div style={{textAlign: "center"}}>
						<button onClick={() => generate2fa.mutate()}>
							Generate QR code
						</button>
						{
							generate2fa.isSuccess &&
							<div>
								<div style={{textAlign: "center", marginTop: "10px"}}>
									<img style={{borderRadius: "18px"}} src={generate2fa.data} />
								</div>
								<form onSubmit={e => {e.preventDefault(); reference.current?.scrollTo(0, 0); setPopup2fa(true)}}>
								<input
									type="text"
									id="NiqueTaMereGoogleChromeBisouxMayeul"
									placeholder="xxx xxx"
									value={code}
									style={{textAlign: "center", width: "6em"}}
									onChange={(ev) => {setCode(ev.currentTarget.value)}}
								/>
								</form>
							</div>
						}
					</div>
				</>
			}
		</section>
		<button
				style={{margin: "0 15px"}}
				className="danger"
				onClick={() => setPopupDel(true)}
			>
				Delete account
			</button>
			{
				popupDel &&
				<ConfirmPopup
					title="Are you sure you want to delete your account?"
					text={<> Warning: This is a permanent operation! </>}
					action="Delete"
					cancelFt={() => setPopupDel(false)}
					actionFt={() => {
						delMe.mutate();
						socket.emit('logOut');
						navigate("/");
						backendLogout.mutate();
					}}
				/>
			}
		{
			popup2fa &&
			<ConfirmPopup
				title="Confirmation"
				text={<>Are you sure you want to enable 2FA on your account?<br /><br />
					You will need your authentication application to be available whenever
					you'll want to log in.
				</>}
				cancelFt={() => setPopup2fa(false)}
				action="Enable"
				actionFt={() => turnOn2fa.mutate(code)}
			/>
		}
		</>
	);
}