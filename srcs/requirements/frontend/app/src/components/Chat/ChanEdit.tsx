import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MutationFunction, useMutation, useQuery } from "@tanstack/react-query";

import { useInvalidate, stopOnHttp } from "../../utils/utils.ts";
import { ChanType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import closeIcon from "../../assets/close.svg";
import radioChecked from "../../assets/radio-checked.svg";
import radioUnchecked from "../../assets/radio-unchecked.svg";
import addIcon from "../../assets/add.svg";

import "../../styles/chat.css";

import Spinner from "../Spinner.tsx";
import ChatHeader from "./ChatHeader.tsx";

interface UserListEntry {
	username: string,
	id: number,
}

// <ChanEdit /> ================================================================

export default function ChanEdit({id}: {id: number})
{
	const [chan, setChan] = useState({
		name: "New Channel",
		status: "public",
		password: "",
		passwordRepeat: "",
		allowed: [
			{username: "Your username", id: 1},
		],
		banned: [],
		admins: [
			{username: "Your username", id: 1},
		],
	});

	const [setPasswd, setSetPasswd] = useState(!id);

	const { api, addNotif } = useContext(MyContext);
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const getChan = useQuery({
		queryKey: ["chan", "" + id],
		queryFn: () => api.get("/channels/" + id),
		retry: stopOnHttp,
		enabled: !!id,
	});

	useEffect(() => {
		if (!getChan.isSuccess)
			return ;
		setChan(prev => {return {...prev, ...getChan.data}});
	}, [getChan.isSuccess]);

	const postChan = useMutation({
		mutationFn:
			(() => api.post("/channels", chan)) as unknown as MutationFunction<ChanType>,
		onError: error => addNotif({content: error.message}),
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chattest/" + data.id)
	});

	const patchChan = useMutation({
		mutationFn:
			(() => api.patch("/channels/" + id, chan)) as unknown as MutationFunction<ChanType>,
		onError: error => addNotif({content: error.message}),
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chattest/" + data.id)
	});

	function updateField(field: string, value: unknown) {
		setChan(prev => {
			return {...prev, [field]: value };
		});
	}

	function isInList(field: keyof typeof chan, value: UserListEntry) {
		const list = chan[field];

		if (!Array.isArray(list))
			return false;
		return (list.some(elem => elem.id == value.id));
	}

	function rmFromList(field: keyof typeof chan, value: UserListEntry) {
		const list = chan[field];

		if (!Array.isArray(list))
			return ;
		updateField(field, list.filter(elem => elem.id != value.id));
	}

	function addToList(field: keyof typeof chan, value: UserListEntry) {
		if (isInList(field, value))
			return ;

		const list = chan[field];

		if (!Array.isArray(list))
			return ;
		updateField(field, [...list, value]);
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

	function patch<T>(a: T, b: T) {
		const ret: Partial<T> = {};

		for (const key in b) {
			if (
				a[key] !== b[key]
				&& (a[key] !== undefined || (key === "password" && setPasswd))
				&& key !== "passwordRepeat"
			)
				ret[key] = b[key];
		}

		return (ret);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!id) {
			postChan.mutate(chan);
			return ;
		}

		patchChan.mutate(patch(getChan.data, chan));
	}

	function preventSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') e.preventDefault();
	}

	if (id && getChan.isPending) return (
		<div className="ChatContent spinner">
			<Spinner />
		</div>
	);

	if (id && getChan.isError) return (
		<div className="ChatContent error">
			Failed to load this channel's data: {getChan.error.message}
		</div>
	);

	return (
		<form className="ChanEdit MainContent" onSubmit={handleSubmit}>
			<ChatHeader chan={{...chan, id: "", membersCount: 1}} edit={true} />
			<section className="ChanEdit__NameSection">
				<label className="ChanEdit__NameLabel" htmlFor="channelName">
					Name
				</label>
				<input
					type="text" id="channelName" name="name"
					value={chan.name} onChange={handleChange} onKeyDown={preventSubmit}
					placeholder="Cannot be empty!"
				/>
			</section>
			<section>
				<span className="ChanEdit__Title">Mode</span>
				<span className="ChanEdit__ModeButtons">
					<label htmlFor="modePublic" className={`${chan.status === "public"}`}>
						Public
						<img src={chan.status === "public" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modePublic" name="status"
						value="public" onChange={handleChange}
						checked={chan.status === "public"}
					/>
					<label htmlFor="modePrivate" className={`${chan.status === "private"}`}>
						Private
						<img src={chan.status === "private" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modePrivate" name="status"
						value="private" onChange={handleChange}
						checked={chan.status === "private"}
					/>
				</span>
			</section>
			{
				chan.status === "public" &&
				<div className="ChanEdit__PublicModeDiv">
				<section className="ChanEdit__PublicModeSection">
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
							onKeyDown={preventSubmit}
							placeholder="Leave blank for no password"
						/>
						{
							!!chan.password.length &&
							<input
								type="password" id="channelPasswordRepeat" name="passwordRepeat"
								value={chan.passwordRepeat} onChange={handleChange}
								onKeyDown={preventSubmit}
								placeholder="Repeat password"
							/>
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
				{
					!!id &&
					<section className="ChanEdit__PublicModeSection banned">
						<UserList
							title="Banned users"
							list={chan.banned}
							add={(value: UserListEntry) => {
								if (value.id == 1)
									return addNotif({content: "You cannot ban yourself!"});
								else if (isInList("admins", value))
									return addNotif({content: "This user is an admin, please"
									+ " unadmin them before banning them."});
								rmFromList("allowed", value);
								addToList("banned", value);
							}}
							rm={(value: UserListEntry) => {
								rmFromList("banned", value)
							}}
							owner={null}
						/>
					</section>
				}
				</div>
			}
			{
				chan.status === "private" &&
				<section className="allowed">
					<UserList
						title="Allowed users"
						list={chan.allowed}
						add={(value: UserListEntry) => {
							addToList("allowed", value);
							rmFromList("banned", value);
						}}
						rm={(value: UserListEntry) => {
							if (isInList("admins", value))
								return addNotif({content: "This user is an admin, please"
									+ " unadmin them before taking them access."});
							rmFromList("admins", value);
							rmFromList("allowed", value);
						}}
						owner={chan.allowed[0]}
					/>
				</section>
			}
			{
				!!id &&
				<section>
					<UserList
						title="Admins"
						list={chan.admins}
						add={(value: UserListEntry) => {
							if (chan.status == "public" && isInList("banned", value))
								return addNotif({content: "This user is banned, please unban"
									+ " them before making them admin."});
							rmFromList("banned", value);
							addToList("allowed", value);
							addToList("admins", value);
						}}
						rm={(value: UserListEntry) => rmFromList("admins", value)}
						owner={chan.admins[0]}
					/>
				</section>
			}
			<button
				style={{marginLeft: "15px"}}
				onClick={(e) => {handleSubmit(e)}}
				disabled={
					chan.status === "public"
					&& chan.password !== chan.passwordRepeat
				}
			>
				Submit
			</button>
		</form>
	);
}

function UserList(
	{title, list, add, rm, owner}:
	{title: string, list: UserListEntry[], add: Function, rm: Function, owner: UserListEntry | null}
)
{
	const listFilter = owner ? list.filter(user => user.id != owner.id) : list;

	const listHTML = listFilter.map(user =>
		<div className="UserList__Item" key={user.id}>
			<div>{user.username}</div>
			<button type="button" onClick={() => {
					rm(list.find(elem => elem.id == user.id))
			}}>
				<img src={closeIcon}/>
			</button>
		</div>);

	const [newAdmin, setNewAdmin] = useState("");

	const anchorRef = useRef<HTMLDivElement>(null);

	const { api, addNotif } = useContext(MyContext);

	async function addUser() {
		setNewAdmin("");
		try {
			const query = await api.get("/users/" + newAdmin);

			if (list.some(elem => elem.id === query.id))
				addNotif({content: "This user is already in the list: " + newAdmin});
			else
				add({username: newAdmin, id: query.id});
			setTimeout(() =>
				anchorRef.current?.scrollIntoView({block: "end", inline: "nearest"}),
				1
			);
		}
		catch (error) {
			if (error instanceof Error) addNotif({content: error.message})
		}
	}

	return (
		<div>
		<div className="ChanEdit__Title">
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
								addUser();
						}}
						placeholder="Add a user"
					/>
				</div>
				<button
					type="button" className="add"
					onClick={addUser}
					disabled={!newAdmin.length}
				>
					<img src={addIcon}/>
				</button>
			</div>
		</div>
		</div>
	);
}