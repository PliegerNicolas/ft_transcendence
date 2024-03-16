import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import { useMutateError, useInvalidate, useGet } from "../../utils/hooks.ts";
import { httpStatus } from "../../utils/utils.ts";
import { ChanType, MemberType, UserType } from "../../utils/types.ts";
import { ChatContentContext, MyContext } from "../../utils/contexts.ts";

import { socket } from "../../App.tsx"

import closeIcon from "../../assets/close.svg";
import addIcon from "../../assets/add.svg";
import defaultPicture from "../../assets/default_profile.png";

import "../../styles/chat.css";

import ChatHeader from "./ChatHeader.tsx";
import GeneralInfos from "./EditGeneralInfos.tsx";
import ConfirmPopup from "../ConfirmPopup.tsx";
import ChanUsername from "./ChanUsername.tsx";
import ModActions from "./ModActions.tsx";
import UserSuggestions from "../UserSuggestions.tsx";

// <ChanEdit /> ================================================================

export default function ChanEdit({id}: {id: number})
{
	const { api, addNotif, me } = useContext(MyContext);
	const { chan, role } = useContext(ChatContentContext);

	const mutateError = useMutateError();
	const invalidate = useInvalidate();
	const navigate = useNavigate();

	const [chanForm, setChanForm] = useState<ChanType>({
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
	const [globOrLists, setGlobOrLists] = useState("global");
	const [dmOrChan, setDmOrChan] = useState("dm");
	const [dmUsername, setDmUsername] = useState("");

	useEffect(() => {
		if (id)
			setChanForm({...chan, password: "", passwordRepeat: "",})
		console.log(chan);
	}, [chan]);

	function updateField(field: string, value: unknown) {
		setChanForm((prev: ChanType) => {
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
			setChanForm({
				...chanForm,
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
				name: chanForm.name,
				visibility: chanForm.visibility,
				mode: chanForm.mode,
				password: chanForm.password,
			});
		else if (
			setPasswd
			|| (chanForm.mode == "password_protected"
				&& chan.mode != "password_protected")
		)
			patchFn.mutate({
				name: chanForm.name,
				visibility: chanForm.visibility,
				mode: chanForm.mode,
				password: chanForm.password,
			});
		else if (chanForm.mode !== "password_protected")
			patchFn.mutate({
				name: chanForm.name,
				visibility: chanForm.visibility,
				mode: chanForm.mode,
		});
		else {
			patchFn.mutate({
				name: chanForm.name,
				visibility: chanForm.visibility,
		});
		}
		console.log("SOCKET EMIT JOIN CHANNEL.");
		socket.emit('joinChannel', chanForm.name);
	}

	async function newDm() {
		try {
			const them = await api.get("/users/" + dmUsername);

			const dmChan = await api.post("/channels", {
				name: "__DM__," + me?.username + "," + them.username,
				visibility: "hidden",
				mode: "invite_only"
			});

			api.patch("/channels/" + dmChan.id + "/manage_access", {
				action: "invite",
				usernames: [them.username],
			})

			console.log(dmChan);
			invalidate(["channels"]);
		}
		catch (e) {
			if (!(e instanceof Error))
				return ;
			if (httpStatus(e) == 404)
				addNotif({content: "No such user!"});
			else
				addNotif({content: e.message});
		}
	}

	if (!id) return (
		<div className="ChanEdit ChatContent MainContent">
			<ChatHeader name={chanForm.name} edit={true} leave={null} />
			<div className="ChanEdit__Scrollable">
				<div className="ChanEdit__GlobOrLists">
					<div
						className={"ChanEdit__GlobOrListsItem " + (dmOrChan === "dm")}
						onClick={() => setDmOrChan("dm")}
					>
						Direct Message
					</div>
					<div
						className={"ChanEdit__GlobOrListsItem " + (dmOrChan === "chan")}
						onClick={() => setDmOrChan("chan")}
					>
						New Channel
					</div>
				</div>
				{
					dmOrChan === "chan" ?
					<GeneralInfos
						id={id}
						chan={chanForm}
						change={handleChange}
						submit={handleSubmit}
						setPasswd={setPasswd}
						setSetPasswd={setSetPasswd}
					/> :
					<section>
						<label className="ChanEdit__NameLabel" htmlFor="channelName">
							Username
						</label>
						<input
							type="text"
							list="UserSuggestions"
							placeholder="Username"
							value={dmUsername}
							onChange={(ev) => setDmUsername(ev.currentTarget.value)}
						/>
						<UserSuggestions />
						<button onClick={() => newDm()} style={{marginLeft: "10px"}}>
							Done
						</button>
					</section>
				}
			</div>
		</div>
	);

	if (role !== "owner" && role !== "operator") return (
		<div className="ChatContent error">
			You are not allowed to edit this channel!
		</div>
	);

	return (
		<div className="ChanEdit ChatContent MainContent">
			<ChatHeader name={chanForm.name} edit={true} leave={null} />
			<div className="ChanEdit__Scrollable">
				<div className="ChanEdit__GlobOrLists">
				{
					role === "owner" &&
					<div
						className={"ChanEdit__GlobOrListsItem " + (globOrLists === "global")}
						onClick={() => setGlobOrLists("global")}
					>
						General Infos
					</div>
				}
					<div
						className={
							"ChanEdit__GlobOrListsItem " + (globOrLists === "lists") + " " + role
						}
						onClick={() => {
							if (chan.mode !== chanForm.mode)
								setPopup(true);
							else
								setGlobOrLists("lists");
						}}
					>
						User lists
					</div>
				</div>
			{
				globOrLists === "global" && role !== "operator" ?
				<GeneralInfos
					id={id}
					chan={chanForm}
					change={handleChange}
					submit={handleSubmit}
					setPasswd={setPasswd || chan.mode != "password_protected"}
					setSetPasswd={setSetPasswd}
				/> :
				<UserLists />
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

function UserLists()
{
	const [allOrRole, setAllOrRole] = useState("all");

	return (
		<div>
			<div className="ChanEdit___AllOrRole">
				<div
					className={"ChanEdit__AllOrRoleItem " + (allOrRole === "all")}
					onClick={() => setAllOrRole("all")}
				>
					All members
				</div>
				<div
					className={"ChanEdit__AllOrRoleItem " + (allOrRole === "role")}
					onClick={() => setAllOrRole("role")}
				>
					By category
				</div>
			</div>
			{
				allOrRole === "role" ?
				<RoleUserLists /> :
				<MemberList />
			}
		</div>
	);
}

function MemberList()
{
	const { me } = useContext(MyContext);
	const { chan } = useContext(ChatContentContext);

	const myMember = chan.members.find(member => member.user.id === me!.id);

	return (
		<div className="MemberList">
		{
			myMember &&
			<>
				<MemberListItem member={myMember} />
				<hr />
			</>
		}
		{
			chan.members.filter(member => member.user.id !== me!.id).map(member =>
				<MemberListItem key={member.id} member={member} />
			)
		}
		</div>
	);
}

function MemberListItem({member}: {member: MemberType})
{
	const getPic = useGet(["users", member.user.username, "picture"]);

	return (
		<div className="MemberListItem">
			<img src={getPic.isSuccess ? getPic.data : defaultPicture}/>
			<ChanUsername member={member} />
			<ModActions
				member={member}
				popupFn={(_: any, action: Function) => action()}
			/>
		</div>
	);
}

function RoleUserLists()
{
	const { chan, role } = useContext(ChatContentContext);
	const { api } = useContext(MyContext);

	const mutateError = useMutateError();
	const invalidate = useInvalidate();

	const action = useMutation({
		mutationFn: (action: actionType) =>
			api.patch("/channels/" + chan.id + "/manage_access", action),
		onError: mutateError,
		onSuccess: () => invalidate(["channels", chan.id]),
	});

	return (
		<>
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
			/>
		</section>
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
			/>
		</section>
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
			/>
		</section>
		{
		role === "owner" &&
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
			/>
		</section>
		}
		</>
	);
}

// <UserList /> ================================================================

function UserList(
	{title, list, add, rm}:
	{title: string, list: UserType[], add: Function, rm: Function}
)
{
	const listHTML = list.map(user =>
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
		catch (e) {
			if (!(e instanceof Error))
				return ;
			if (httpStatus(e) == 404)
				addNotif({content: "No such user: '" + newUser + "'"})
			else
				addNotif({content: e.message})
		}
	}

	return (
		<div>
			<div className="ChanEdit__Title">
				{title}
				<span className="notice-msg" style={{marginLeft: "6px"}}>
					({list.length})
				</span>
			</div>
			<div className="UserList">
			{
				!!list.length &&
				<div className="UserList__Box">
					<div className="genericList">
						{listHTML}
						<div ref={anchorRef} style={{height: "0", border: "none"}} />
					</div>
				</div>
			}
				<div className="UserList__Add">
					<div className="UserList__InputContainer">
						<input
							type="text"
							list="UserSuggestions"
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
						<UserSuggestions />
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