import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MutationFunction, useMutation, useQuery } from "@tanstack/react-query";

import { useInvalidate, useStopOnHttp, httpStatus, useMutateError } from "../../utils/utils.ts";
import { ChanType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import closeIcon from "../../assets/close.svg";
import radioChecked from "../../assets/radio-checked.svg";
import radioUnchecked from "../../assets/radio-unchecked.svg";
import addIcon from "../../assets/add.svg";

import "../../styles/chat.css";

import Spinner from "../Spinner.tsx";
import ChatHeader from "./ChatHeader.tsx";
import ConfirmPopup from "../ConfirmPopup.tsx";

interface UserListEntry {
	username: string,
	id: number,
}
/*
function getToForm(chan: ChanType) {
	return ({
		...chan,
		allowed: chan.members.
	});
}*/

// <ChanEdit /> ================================================================

export default function ChanEdit({id}: {id: number})
{
	const [chan, setChan] = useState({
		name: "New Channel",
		visibility: "public",
		mode: "open",
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
	const [popup, setPopup] = useState(false);

	const { api, addNotif } = useContext(MyContext);
	const invalidate = useInvalidate();
	const navigate = useNavigate();
	const stopOnHttp = useStopOnHttp();
	const mutateError = useMutateError();

	const getChan = useQuery({
		queryKey: ["chan", "" + id],
		queryFn: () => api.get("/channels/" + id),
		retry: stopOnHttp,
		enabled: !!id,
	});

	const delChan = useMutation({
		mutationFn: () => api.delete("/channels/" + id),
		onSettled: () => invalidate(["allChans"]),
		onSuccess: () => navigate("/chat"),
		onError: mutateError,
	});

	useEffect(() => {
		if (!getChan.isSuccess)
			return ;
		setChan(prev => {return {...prev, ...getChan.data, password: ""}});
	}, [getChan.isSuccess]);

	const postChan = useMutation({
		mutationFn:
			((data: ChanType) => {
				console.log(data);
				return api.post("/channels", data)}) as unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chat/" + data.id)
	});

	const patchChan = useMutation({
		mutationFn:
			((data: ChanType) => {
				console.log(data);
				return api.patch("/channels/" + id, data)}) as unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSettled: () => invalidate(["allChans"]),
		onSuccess: (data: ChanType) => navigate("/chat/" + data.id)
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
				&& (key !== "password" || setPasswd)
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

	console.log(getChan.data);

	return (
		<div className="ChanEdit ChatContent MainContent" onSubmit={handleSubmit}>
			<ChatHeader name={chan.name} edit={true} />
			<div className="ChanEdit__Scrollable">
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
					<label htmlFor="modeInvite" className={`${chan.mode === "invite_only"}`}>
						Invite
						<img src={chan.mode === "invite_only" ? radioChecked : radioUnchecked}/>
					</label>
					<input
						type="radio" id="modeInvite" name="mode"
						value="invite_only" onChange={handleChange}
						checked={chan.mode === "invite_only"}
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
				</span>
			</section>
			{
				chan.mode === "password_protected" &&
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
							placeholder="Leave blank for no password"
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
				chan.mode === "invite_only" &&
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
							if (chan.visibility == "public" && isInList("banned", value))
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
			<div className="ChanEdit__FinalButtons" style={{marginLeft: "15px"}}>
				{
					!!id &&
					<button className="danger" onClick={() => setPopup(true)}>
						Delete
					</button>
				}
				<button
					onClick={(e) => {handleSubmit(e)}}
					disabled={
						chan.mode === "password_protected"
						&& (chan.password !== chan.passwordRepeat
							|| (!!chan.password.length && chan.password.length < 8))
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
		</div>
	);
}

// <UserList /> ================================================================

function UserList(
	{title, list, add, rm, owner}:
	{
		title: string,
		list: UserListEntry[],
		add: Function,
		rm: Function,
		owner: UserListEntry | null
	}
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
			if (!(error instanceof Error))
				return ;
			if (httpStatus(error) == 404)
				addNotif({content: "No such user: '" + newAdmin + "'"})
			else
				addNotif({content: error.message})
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