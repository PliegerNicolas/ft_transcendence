import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MutationFunction, useMutation } from "@tanstack/react-query";

import { useInvalidate, useMutateError } from "../../utils/utils.ts";
import { ChanType, ChanFormType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import radioChecked from "../../assets/radio-checked.svg";
import radioUnchecked from "../../assets/radio-unchecked.svg";

import "../../styles/chat.css";

import ConfirmPopup from "../ConfirmPopup.tsx";

export default function GeneralInfos(
	{id, origChan}:
	{id: number, origChan: ChanFormType}
)
{
	const {api} = useContext(MyContext);

	const mutateError = useMutateError();
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const [setPasswd, setSetPasswd] = useState(!id);
	const [popup, setPopup] = useState(false);
	const [chan, setChan] = useState(origChan);

	const delChan = useMutation({
		mutationFn: () => api.delete("/channels/" + id),
		onSettled: () => invalidate(["allChans"]),
		onSuccess: () => navigate("/chat"),
		onError: mutateError,
	});

	const postChan = useMutation({
		mutationFn:
			((data: ChanType) => {
				console.log(data);
				return api.post("/channels", data)}) as
					unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chat/" + data.id)
	});

	const patchChan = useMutation({
		mutationFn:
			((data: ChanType) => {
				console.log(data);
				return api.patch("/channels/" + id, data)}) as
					unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chat/" + data.id)
	});

	// SOME USEFUL FUNCTIONS -----------------------------------------------------

	function updateField(field: string, value: unknown) {
		setChan(prev => {
			return {...prev, [field]: value };
		});
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.name === "password" && e.target.value === "") {
			setChan({
				...chan,
				password: "",
				passwordRepeat: "",
			});
		}
		else updateField(e.target.name, e.target.value);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!id)
			postChan.mutate(chan);
		else if (setPasswd)
			patchChan.mutate(chan);
		else
			patchChan.mutate({
				name: chan.name,
				visibility: chan.visibility,
				mode: chan.mode,
		});
	}

	// RENDER --------------------------------------------------------------------

	return (
		<div>
			{/* NAME SECTION ----------------------------------------------------- */}
			<section className="ChanEdit__NameSection">
				<label className="ChanEdit__NameLabel" htmlFor="channelName">
					Name
				</label>
				<input
					type="text" id="channelName" name="name"
					value={chan.name} onChange={handleChange}
					placeholder="Cannot be empty!"
				/>
			</section>
			{/* VISIBILITY SECTION ----------------------------------------------- */}
			<section>
				<span className="ChanEdit__Title">Visibility</span>
				<span className="ChanEdit__ModeButtons">
					<label htmlFor="visibilityPublic" className={`${chan.visibility === "public"}`}>
						Public
						<img src={chan.visibility === "public" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="visibilityPublic" name="visibility"
						value="public" onChange={handleChange}
						checked={chan.visibility === "public"}
					/>
					<label htmlFor="visibilityHidden" className={`${chan.visibility === "hidden"}`}>
						Hidden
						<img src={chan.visibility === "hidden" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="visibilityHidden" name="visibility"
						value="hidden" onChange={handleChange}
						checked={chan.visibility === "hidden"}
					/>
				</span>
			</section>
			{/* MODE SECTION ----------------------------------------------------- */}
			<section>
				<span className="ChanEdit__Title">Mode</span>
				<span className="ChanEdit__ModeButtons">
					<label htmlFor="modeOpen" className={`${chan.mode === "open"}`}>
						Open
						<img src={chan.mode === "open" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modeOpen" name="mode"
						value="open" onChange={handleChange}
						checked={chan.mode === "open"}
					/>
					<label htmlFor="modePassword" className={`${chan.mode === "password_protected"}`}>
						Password
						<img src={chan.mode === "password_protected" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modePassword" name="mode"
						value="password_protected" onChange={handleChange}
						checked={chan.mode === "password_protected"}
					/>
					<label htmlFor="modeInvite" className={`${chan.mode === "invite_only"}`}>
						Invite
						<img src={chan.mode === "invite_only" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modeInvite" name="mode"
						value="invite_only" onChange={handleChange}
						checked={chan.mode === "invite_only"}
					/>
				</span>
			</section>
			{/* PASSWORD SECTION -------------------------------------------------- */
				chan.mode === "password_protected" &&
				<section>
				<div className="ChanEdit__Title">
					Password
					{
						!!id &&
						<span className="ChanEdit__SetPasswd">
							<label htmlFor="setPasswd">
								Change:
								<div className={"checkBox " + setPasswd}></div>
							</label>
							<input
								type="checkbox" id="setPasswd" checked={setPasswd}
								onChange={() => setSetPasswd(prev => !prev)}
							/>
						</span>
					}
				</div>
				{
					setPasswd &&
					<div className="ChanEdit__PasswdFields">
						<input
							type="password" id="channelPassword" name="password"
							value={chan.password} onChange={handleChange}
							placeholder="Password"
						/>
						{
							!!chan.password.length &&
							<input
								type="password" id="channelPasswordRepeat" name="passwordRepeat"
								value={chan.passwordRepeat} onChange={handleChange}
								placeholder="Repeat password"
							/>
						}
						{
							!!chan.password.length
								&& chan.password.length < 8
								&& <span className="error-msg">Password length must be 8 or more!</span>
						}
						{
							!!chan.password.length
								&& !!chan.passwordRepeat.length
								&& chan.password != chan.passwordRepeat
								&& <span className="error-msg">Passwords do not match!</span>
						}
					</div>
				}
				</section>
			}
			<div className="ChanEdit__FinalButtons" style={{marginLeft: "15px"}}>
				{
					!!id &&
					<button className="danger" onClick={() => setPopup(true)}>
						Delete channel
					</button>
				}
				<button
					onClick={handleSubmit}
					disabled={
						chan.mode === "password_protected"
						&& (chan.password !== chan.passwordRepeat
							|| (chan.password.length < 8))
					}
				>
					Submit
				</button>
			</div>
			{
				popup &&
				<ConfirmPopup
					title="Are you sure you want to delete this channel?"
					text={<>Warning: This is a permanent operation!</>}
					action="Delete"
					cancelFt={() => setPopup(false)}
					actionFt={delChan.mutate}
				/>
			}
		</div>
	);
}