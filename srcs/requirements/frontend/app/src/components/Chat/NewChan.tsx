import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MutationFunction, useMutation } from "@tanstack/react-query";

import { useInvalidate } from "../../utils/utils.ts";
import { ChanType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import close from "../../assets/close.svg";
import radioChecked from "../../assets/radio-checked.svg";
import radioUnchecked from "../../assets/radio-unchecked.svg";
import add from "../../assets/add.svg";

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";

// <NewChan /> =================================================================

export default function NewChan()
{
	const [newChan, setNewChan] = useState({
		id: "",
		size: 1,
		name: "New Channel",
		mode: "public",
		password: "",
		passwordRepeat: "",
		allowed: [],
		admins: [],
	});

	const dummyUsers = [
		"mlaneyri",
		"julboyer",
		"nplieger",
		"anbourge"
	];

	const { api } = useContext(MyContext);
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const postChan = useMutation({
		mutationFn:
			((name: string) => api.post("/users/1/channels", {name})) as
			MutationFunction<ChanType>,
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chattest/" + data.id)
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setNewChan({
			...newChan,
			[e.target.name]: e.currentTarget.value
		});
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		postChan.mutate(newChan.name);
	}

	return (
		<form className="NewChan MainContent" onSubmit={handleSubmit}>
			<ChatHeader chan={newChan} />
			<section className="NewChan__NameSection">
				<label className="NewChan__NameLabel" htmlFor="channelName">
					Name
				</label>
				<input
					type="text"
					id="channelName"
					name="name"
					value={newChan.name}
					onChange={handleChange}
					placeholder="Cannot be empty!"
					required
				/>
			</section>
			<section>
				<span className="NewChan__Title">Mode</span>
				<span className="NewChan__ModeButtons">
					<label htmlFor="modePublic" className={`${newChan.mode === "public"}`}>
						Public
						<img src={newChan.mode === "public" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio"
						id="modePublic"
						name="mode"
						value="public"
						onChange={handleChange}
						checked={newChan.mode === "public"}
					/>
					<label htmlFor="modePrivate" className={`${newChan.mode === "private"}`}>
						Private
						<img src={newChan.mode === "private" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio"
						id="modePrivate"
						name="mode"
						value="private"
						onChange={handleChange}
						checked={newChan.mode === "private"}
					/>
				</span>
			</section>
			{
				newChan.mode === "public" &&
				<section>
					<div className="NewChan__Title">Password</div>
					<div className="NewChan__PasswdFields">
						<input
							type="password"
							id="channelPassword"
							name="password"
							value={newChan.password}
							onChange={handleChange}
							placeholder="Leave blank for no password"
						/>
						<input
							type="password"
							id="channelPasswordRepeat"
							name="passwordRepeat"
							value={newChan.passwordRepeat}
							onChange={handleChange}
							placeholder="Repeat password"
						/>
						{
							!!newChan.password.length
								&& !!newChan.passwordRepeat.length
								&& newChan.password != newChan.passwordRepeat
								&& <span className="error-msg">Passwords do not match!</span>
						}
					</div>
				</section>
			}
			{
				newChan.mode === "private" &&
				<section>
					<div className="NewChan__Title">Allowed users</div>
					<div className="NewChan__UserList">

					</div>
				</section>
			}
			<section>
				<div className="NewChan__Title">Admins</div>
				<div className="NewChan__UserList">
				{
					dummyUsers.map((user, index) =>
						<div className="UserList__Item" key={index}>
							<div>{user}</div>
							<button type="button"><img src={close}/></button>
						</div>)
				}
					<div className="UserList__Item">
						<div>
							<input
								type="text"
								placeholder="Add an admin"
							/>
						</div>
						<button type="button" className="add">
							<img src={add}/>
						</button>
					</div>
				</div>
			</section>
			<button
				style={{marginLeft: "15px"}}
				disabled={
					newChan.mode === "public"
					&& newChan.password !== newChan.passwordRepeat
				}
			>
				Submit
			</button>
		</form>
	);
}