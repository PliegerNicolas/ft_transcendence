import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import { useMutateError, useInvalidate, useGet } from "../../utils/hooks.ts";
import { httpStatus, getChanRole } from "../../utils/utils.ts";
import { ChanType, UserType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import { socket } from "../../App.tsx"

import closeIcon from "../../assets/close.svg";
import addIcon from "../../assets/add.svg";

import "../../styles/chat.css";

import Spinner from "../Spinner.tsx";
import ChatHeader from "./ChatHeader.tsx";
import GeneralInfos from "./EditGeneralInfos.tsx";
import ConfirmPopup from "../ConfirmPopup.tsx";

// <ChanEdit /> ================================================================

export default function ChanEdit({id}: {id: number})
{
	const {api} = useContext(MyContext);
	const [globOrLists, setGlobOrLists] = useState("global");
	const mutateError = useMutateError();
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const [chan, setChan] = useState<ChanType>({
		name: "New Channel",
		visibility: "public",
		mode: "open",
		password: "",
		passwordRepeat: "",
		bannedUsers: [],
		invitedUsers: [],
		mutedUsers: [],
		id: "",
		membersCount: 1,
		members: [],
	});

	const [setPasswd, setSetPasswd] = useState(!id);
	const [popup, setPopup] = useState(false);

	const getChan = useGet(["channels", "" + id], !!id);
	const getMe = useGet(["me"]);

	useEffect(() => {
		if (!getChan.isSuccess)
			return ;
		setChan({...getChan.data, password: "", passwordRepeat: "",})
		console.log(getChan.data);
	}, [getChan.isSuccess]);

	function updateField(field: string, value: unknown) {
		setChan((prev: ChanType) => {
			return {...prev, [field]: value };
		});
	}

	const postChan = useMutation({
		mutationFn: ((data: ChanType) => api.post("/channels", data)) as
			unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSettled: () => invalidate(["channels"]),
		onSuccess: (data: ChanType) => navigate("/chat/" + data.id)
	});

	const patchChan = useMutation({
		mutationFn:
			((data: ChanType) => {
				console.log(data);
				return api.patch("/channels/" + id, data)}) as
					unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSettled: () => invalidate(["channels"]),
		onSuccess: (data: ChanType) => navigate("/chat/" + data.id)
	});

	const patchChanNoRedirect = useMutation({
		mutationFn: ((data: ChanType) => api.patch("/channels/" + id, data)) as
			unknown as MutationFunction<ChanType>,
		onError: mutateError,
		onSuccess: (data: ChanType) => invalidate(["channels", data.id])
	});

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

	function handleSubmit(redirect = true) {
		const patchFn = redirect ? patchChan : patchChanNoRedirect;

		if (!id)
			postChan.mutate({
				name: chan.name,
				visibility: chan.visibility,
				mode: chan.mode,
				password: chan.password,
			});
		else if (setPasswd)
			patchFn.mutate({
				name: chan.name,
				visibility: chan.visibility,
				mode: chan.mode,
				password: chan.password,
			});
		else
			patchFn.mutate({
				name: chan.name,
				visibility: chan.visibility,
				mode: chan.mode,
		});
		socket.emit('joinChannel', chan.name);
	}

	if (!id) return (
		<div className="ChanEdit ChatContent MainContent">
			<ChatHeader name={chan.name} edit={true} />
			<div className="ChanEdit__Scrollable">
				<GeneralInfos
					id={id}
					chan={chan}
					change={handleChange}
					submit={handleSubmit}
					setPasswd={setPasswd}
					setSetPasswd={setSetPasswd}
				/>
			</div>
		</div>
	);

	if (getChan.isPending || !getMe.isSuccess) return (
		<div className="ChatContent spinner">
			<Spinner />
		</div>
	);

	if (getChan.isError) return (
		<div className="ChatContent error">
			Failed to load this channel's data: {getChan.error.message}
		</div>
	);

	const role = getChanRole(getChan.data, getMe.data.id);

	if (role !== "owner" && role !== "operator") return (
		<div className="ChatContent error">
			You are not allowed to edit this channel!
		</div>
	);

	return (
		<div className="ChanEdit ChatContent MainContent">
			<ChatHeader name={chan.name} edit={true} />
			<div className="ChanEdit__Scrollable">
				<div className="ChanEdit__GlobOrLists">
					<div
						className={"ChanEdit__GlobOrListsItem " + (globOrLists === "global")}
						onClick={() => {
							setGlobOrLists("global");
							console.log(getChan.data.mode + " vs. " + chan.mode);
						}}
					>
						General Infos
					</div>
					<div
						className={"ChanEdit__GlobOrListsItem " + (globOrLists === "lists")}
						onClick={() => {
							if (getChan.data.mode !== chan.mode)
								setPopup(true);
							else
								setGlobOrLists("lists");
							console.log("coucou");
						}}
					>
						User lists
					</div>
				</div>
			{
				(getChan.isSuccess) &&
				globOrLists === "global" ?
				<GeneralInfos
					id={id}
					chan={chan}
					change={handleChange}
					submit={handleSubmit}
					setPasswd={setPasswd}
					setSetPasswd={setSetPasswd}
				/> :
				<UserLists chan={getChan.data} />
			}
			</div>
			{
				popup &&
				<ConfirmPopup
					title="Warning"
					text={<>
						The channel mode has been modified.<br /><br />If you want to edit
						the user lists, you first need to submit the changes.
					</>}
					cancelFt={() => setPopup(false)}
					action="Submit"
					actionFt={() => {
						handleSubmit(false);
						setGlobOrLists("lists");
						setPopup(false);
					}}
				/>
			}
		</div>
	);
}

// <UserLists /> ===============================================================

interface actionType {
	action: string,
	usernames: Array<string>,
}

function UserLists({chan}: {chan: ChanType})
{
	const {api} = useContext(MyContext);
	const mutateError = useMutateError();
	const invalidate = useInvalidate();

	const action = useMutation({
		mutationFn: (action: actionType) =>
			api.patch("/channels/" + chan.id + "/manage_access", action),
		onError: mutateError,
		onSuccess: () => invalidate(["channels", chan.id]),
	});

	return (
		<div>
			{
				chan.mode !== "invite_only" &&
				<section className="banned">
					<UserList
						title="Banned users"
						list={chan.bannedUsers}
						add={(value: UserType) => {
							action.mutate({action: "ban", usernames: [value.username]});
						}}
						rm={(value: UserType) => {
							action.mutate({action: "deban", usernames: [value.username]});
						}}
						owner={null}
					/>
				</section>
			}
			{
				chan.mode === "invite_only" &&
				<section className="allowed">
					<UserList
						title="Invited users"
						list={chan.invitedUsers}
						add={(value: UserType) =>
							action.mutate({action: "invite", usernames: [value.username]})
						}
						rm={(value: UserType) =>
							action.mutate({action: "uninvite", usernames: [value.username]})
						}
						owner={null}
					/>
				</section>
			}
			<section className="muted">
				<UserList
					title="Muted users"
					list={chan.mutedUsers}
					add={(value: UserType) =>
						action.mutate({action: "mute", usernames: [value.username]})
					}
					rm={(value: UserType) =>
						action.mutate({action: "unmute", usernames: [value.username]})
					}
					owner={null}
				/>
			</section>
			<section className="admins">
				<UserList
					title="Admins"
					list={
						chan.members.filter(item => item.role === "operator").map(item => item.user)
					}
					add={(value: UserType) =>
						action.mutate({action: "promote", usernames: [value.username]})
					}
					rm={(value: UserType) =>
						action.mutate({action: "demote", usernames: [value.username]})
					}
					owner={null}
				/>
			</section>
		</div>
	);
}

// <UserList /> ================================================================

function UserList(
	{title, list, add, rm, owner}:
	{
		title: string,
		list: UserType[],
		add: Function,
		rm: Function,
		owner: UserType | null
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

	const [newUser, setNewUser] = useState("");

	const anchorRef = useRef<HTMLDivElement>(null);

	const { api, addNotif } = useContext(MyContext);

	async function addUser() {
		setNewUser("");
		try {
			const query = await api.get("/users/" + newUser);

			if (list.some(elem => elem.id === query.id))
				addNotif({content: "This user is already in the list: " + newUser});
			else
				add({username: newUser, id: query.id});
			setTimeout(() =>
				anchorRef.current?.scrollIntoView({block: "end", inline: "nearest"}),
				1
			);
		}
		catch (error) {
			if (!(error instanceof Error))
				return ;
			if (httpStatus(error) == 404)
				addNotif({content: "No such user: '" + newUser + "'"})
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
						value={newUser}
						onChange={e => setNewUser(e.target.value)}
						onKeyDown={e => {
							if (e.key !== 'Enter')
								return;
							if (newUser.length)
								addUser();
						}}
						placeholder="Add a user"
					/>
				</div>
				<button
					type="button" className="add"
					onClick={addUser}
					disabled={!newUser.length}
				>
					<img src={addIcon}/>
				</button>
			</div>
		</div>
		</div>
	);
}