import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MutationFunction, useMutation } from "@tanstack/react-query";

import { useInvalidate } from "../../utils/utils.ts";
import { ChanType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import closeIcon from "../../assets/close.svg";
import radioChecked from "../../assets/radio-checked.svg";
import radioUnchecked from "../../assets/radio-unchecked.svg";
import addIcon from "../../assets/add.svg";

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";

// <NewChan /> =================================================================

export default function NewChan()
{
	const [newChan, setNewChan] = useState({
		name: "New Channel",
		status: "public",
		password: "",
		passwordRepeat: "",
		allowed: [
			{username: "mlaneyri", id: 1},
		],
		banned: [],
		admins: [
			{username: "mlaneyri", id: 1},
			{username: "julboyer", id: 2},
			{username: "nplieger", id: 3},
			{username: "anbourge", id: 4},
		],
	});

	const { api, addNotif } = useContext(MyContext);
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const postChan = useMutation({
		mutationFn:
			(() => api.post("/channels", newChan)) as unknown as MutationFunction<ChanType>,
		onError: error => addNotif({content: error.message}),
		onSettled: () => {console.log(newChan); invalidate(["allChans"])},
		onSuccess: (data: ChanType) => navigate("/chattest/" + data.id)
	});

	function updateField(field: string, value: unknown) {
		return ({ ...newChan, [field]: value });
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.name === "password" && e.target.value === "") {
			setNewChan({
				...newChan,
				password: "",
				passwordRepeat: "",
			});
		}
		else setNewChan(updateField(e.target.name, e.target.value));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		postChan.mutate(newChan);
	}

	function preventSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') e.preventDefault();
	}

	return (
		<form className="NewChan MainContent" onSubmit={handleSubmit}>
			<ChatHeader chan={{...newChan, id: "", size: 1}} />
			<section className="NewChan__NameSection">
				<label className="NewChan__NameLabel" htmlFor="channelName">
					Name
				</label>
				<input
					type="text" id="channelName" name="name"
					value={newChan.name} onChange={handleChange} onKeyDown={preventSubmit}
					placeholder="Cannot be empty!"
				/>
			</section>
			<section>
				<span className="NewChan__Title">Mode</span>
				<span className="NewChan__ModeButtons">
					<label htmlFor="modePublic" className={`${newChan.status === "public"}`}>
						Public
						<img src={newChan.status === "public" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modePublic" name="status"
						value="public" onChange={handleChange}
						checked={newChan.status === "public"}
					/>
					<label htmlFor="modePrivate" className={`${newChan.status === "private"}`}>
						Private
						<img src={newChan.status === "private" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modePrivate" name="status"
						value="private" onChange={handleChange}
						checked={newChan.status === "private"}
					/>
				</span>
			</section>
			{
				newChan.status === "public" &&
				<div className="NewChan__PublicModeDiv">
				<section className="NewChan__PublicModeSection">
					<div className="NewChan__Title">Password</div>
					<div className="NewChan__PasswdFields">
						<input
							type="password" id="channelPassword" name="password"
							value={newChan.password} onChange={handleChange}
							onKeyDown={preventSubmit}
							placeholder="Leave blank for no password"
						/>
						{
							!!newChan.password.length &&
							<input
								type="password" id="channelPasswordRepeat" name="passwordRepeat"
								value={newChan.passwordRepeat} onChange={handleChange}
								onKeyDown={preventSubmit}
								placeholder="Repeat password"
							/>
						}
						{
							!!newChan.password.length
								&& !!newChan.passwordRepeat.length
								&& newChan.password != newChan.passwordRepeat
								&& <span className="error-msg">Passwords do not match!</span>
						}
					</div>
				</section>
				<section className="NewChan__PublicModeSection">
					<UserList
						title="Banned users"
						list={newChan.banned}
						update={(value: {username: string, id: number}) =>
							setNewChan(updateField("banned", value))}
						owner={null}
					/>
				</section>
				</div>
			}
			{
				newChan.status === "private" &&
				<section>
					<UserList
						title="Allowed users"
						list={newChan.allowed}
						update={(value: {username: string, id: number}) =>
							setNewChan(updateField("allowed", value))}
						owner={newChan.allowed[0]}
					/>
				</section>
			}
			<section>
				<UserList
					title="Admins"
					list={newChan.admins}
					update={(value: {username: string, id: number}) =>
						setNewChan(updateField("admins", value))}
					owner={newChan.admins[0]}
				/>
			</section>
			<button
				style={{marginLeft: "15px"}}
				onClick={(e) => {handleSubmit(e)}}
				disabled={
					newChan.status === "public"
					&& newChan.password !== newChan.passwordRepeat
				}
			>
				Submit
			</button>
		</form>
	);
}

function UserList(
	{title, list, update, owner}:
	{title: string, list: {username: string, id: number}[], update: Function, owner: {username: string, id: number} | null}
)
{
	const listFilter = owner ? list.filter(user => user.id != owner.id) : list;

	const listHTML = listFilter.map(user =>
		<div className="UserList__Item" key={user.id}>
			<div>{user.username}</div>
			<button type="button" onClick={() => rm(user.id)}>
				<img src={closeIcon}/>
			</button>
		</div>);

	const [newAdmin, setNewAdmin] = useState("");

	const anchorRef = useRef<HTMLDivElement>(null);

	function add() {
		update([
			...list,
			{username: newAdmin, id: +Math.random().toString().slice(-10, -1)}
		]);
		setNewAdmin("");
		setTimeout(() =>
			anchorRef.current?.scrollIntoView({block: "end", inline: "nearest"}),
			100
		);
	}

	function rm(id: number) {
		update(list.filter(user => user.id != id));
	}

	return (
		<div>
		<div className="NewChan__Title">
			{title}
			<span className="notice-msg" style={{marginLeft: "6px"}}>
				({listFilter.length + (owner ? 1 : 0)})
			</span>
		</div>
		<div className="UserList">
		{
			(!!owner || !!listFilter.length) &&
			<div className="UserList__Box">
				<div className="genericList">
					{
						owner &&
						<div className="UserList__Item">
							<div>{owner.username}</div>
							<div className="notice-msg">
								(You)
							</div>
						</div>
					}
					{listHTML}
					<div ref={anchorRef} style={{height: "0", border: "none"}} />
				</div>
			</div>
		}
			<div className="UserList__Add">
				<div className="UserList__InputContainer">
					<input
						type="text"
						value={newAdmin}
						onChange={e => setNewAdmin(e.target.value)}
						onKeyDown={e => {
							if (e.key !== 'Enter')
								return;
							e.preventDefault();
							if (newAdmin.length)
								add();
						}}
						placeholder="Add a user"
					/>
				</div>
				<button
					type="button" className="add"
					onClick={add}
					disabled={!newAdmin.length}
				>
					<img src={addIcon}/>
				</button>
			</div>
		</div>
		</div>
	);
}