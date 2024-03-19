import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, MutationFunction } from "@tanstack/react-query";

import { useMutateError, useInvalidate, useGet } from "../../utils/hooks.ts";
import { httpStatus } from "../../utils/utils.ts";
import { ChanSpecsType, ChanType, MemberType } from "../../utils/types.ts";
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
		bannedMembers: [],
		invitedMembers: [],
		mutedMembers: [],
		activeMembers: [],
		inactiveMembers: [],
		id: "",
		membersCount: 1,
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
		mutationFn: ((data: ChanSpecsType) => api.post("/channels", data)) as MutationFunction<ChanSpecsType>,
		onError: mutateError,
		onSettled: () => invalidate(["channels"]),
		onSuccess: (data: ChanSpecsType) => navigate("/chat/" + data.channel.id)
	});

	const patchChan = useMutation({
		mutationFn:
			((data: ChanSpecsType) => {
				console.log(data);
				return api.patch("/channels/" + id, data)}) as MutationFunction<ChanSpecsType>,
		onError: mutateError,
		onSettled: () => invalidate(["channels"]),
		onSuccess: ((data: ChanSpecsType) => navigate("/chat/" + data.channel.id))
	});

	const patchChanNoRedirect = useMutation({
		mutationFn: ((data: ChanSpecsType) => api.patch("/channels/" + id, data)) as MutationFunction<ChanSpecsType>,
		onError: mutateError,
		onSuccess: (data: ChanSpecsType) => invalidate(["channels", data.channel.id])
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

	const myMember = chan.activeMembers.find(member => member.user.id === me!.id);

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
			chan.activeMembers.filter((member) => member.user.id !== me!.id).map((member) =>
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
			<ChannelMemberList
				title="Invited users"
				list={chan.invitedMembers}
				add={(name: string) => action.mutate({action: "invite", usernames: [name]})}
				rm={(name: string) => action.mutate({action: "uninvite", usernames: [name]})}
			/>
		</section>
		<section className="muted">
			<ChannelMemberList
				title="Muted users"
				list={chan.mutedMembers}
				add={(name: string) => action.mutate({action: "mute", usernames: [name]})}
				rm={(name: string) => action.mutate({action: "unmute", usernames: [name]})}
			/>
		</section>
		<section className="banned">
			<ChannelMemberList
				title="Banned users"
				list={chan.bannedMembers}
				add={(name: string) => action.mutate({action: "ban", usernames: [name]})}
				rm={(name: string) => action.mutate({action: "deban", usernames: [name]})}
			/>
		</section>
		{
		role === "owner" &&
		<section className="admins">
			<ChannelMemberList
				title="Admins"
				list={chan.activeMembers.filter((member) => member.role === "operator")}
				add={(name: string) => action.mutate({action: "promote", usernames: [name]})}
				rm={(name: string) => action.mutate({action: "demote", usernames:[name]})}
			/>
		</section>
		}
		</>
	);
}

// <UserList /> ================================================================

function ChannelMemberList(
	{title, list, add, rm}:
	{title: string, list: MemberType[], add: Function, rm: Function}
)
{
	const listHTML = list.map((member) =>
		<div className="UserList__Item" key={member.user.id}>
			<div>{member.user.username}</div>
			<button type="button" onClick={() => {
					rm(list.find(elem => elem.id == member.user.id))
			}}>
				<img src={closeIcon}/>
			</button>
		</div>);

	const [newUser, setNewUser] = useState("");

	const anchorRef = useRef<HTMLDivElement>(null);


	async function addUser() {
		setNewUser("");
		add(newUser);
		setTimeout(() =>
			anchorRef.current?.scrollIntoView({block: "end", inline: "nearest"}), 1);
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