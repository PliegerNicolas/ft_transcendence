import { useState, useContext, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useStopOnHttp, httpStatus } from "../../utils/utils.ts";
import { ChanType, UserType } from "../../utils/types.ts";
import { MyContext } from "../../utils/contexts.ts";

import closeIcon from "../../assets/close.svg";
import addIcon from "../../assets/add.svg";

import "../../styles/chat.css";

import Spinner from "../Spinner.tsx";
import ChatHeader from "./ChatHeader.tsx";
import GeneralInfos from "./EditGeneralInfos.tsx";

// <ChanEdit /> ================================================================

export default function ChanEdit({id}: {id: number})
{
	const {api} = useContext(MyContext);
	const [globOrLists, setGlobOrLists] = useState("global");
	const stopOnHttp = useStopOnHttp();

	const [chan, setChan] = useState({
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

	const getChan = useQuery({
		queryKey: ["chan", "" + id],
		queryFn: () => api.get("/channels/" + id),
		retry: stopOnHttp,
		enabled: !!id,
	});

	useEffect(() => {
		if (!id)
			return ;
		setChan({...getChan.data, password: ""})
	}, [getChan.isSuccess]);


	if (!id) return (
		<div className="ChanEdit ChatContent MainContent">
			<ChatHeader name={chan.name} edit={true} />
			<div className="ChanEdit__Scrollable">
				<GeneralInfos id={id} chan={chan} setChan={setChan} />
			</div>
		</div>
	);

	if (getChan.isPending) return (
		<div className="ChatContent spinner">
			<Spinner />
		</div>
	);

	if (getChan.isError) return (
		<div className="ChatContent error">
			Failed to load this channel's data: {getChan.error.message}
		</div>
	);

	console.log(chan);

	return (
		<div className="ChanEdit ChatContent MainContent">
			<ChatHeader name={chan.name} edit={true} />
			<div className="ChanEdit__Scrollable">
				<div className="ChanEdit__GlobOrLists">
					<div
						className={"ChanEdit__GlobOrListsItem " + (globOrLists === "global")}
						onClick={() => setGlobOrLists("global")}
					>
						General Infos
					</div>
					<div
						className={"ChanEdit__GlobOrListsItem " + (globOrLists === "lists")}
						onClick={() => setGlobOrLists("lists")}
					>
						User lists
					</div>
				</div>
			{
				(getChan.isSuccess) &&
				globOrLists === "global" ?
				<GeneralInfos id={id} chan={chan} setChan={setChan} /> :
				<UserLists chan={chan} />
			}
			</div>
		</div>
	);
}

// <UserLists /> ===============================================================

function UserLists({chan}: {chan: ChanType})
{
	const {addNotif} = useContext(MyContext);

	function isInList(name: string, user: UserType) {
		name + user;
		addNotif({type: 1, content: "SOON™"});
		return (false);
	}

	function rmFromList(name: string, user: UserType) {
		name + user;
		addNotif({type: 1, content: "SOON™"});
	}

	function addToList(name: string, user: UserType) {
		name + user;
		addNotif({type: 1, content: "SOON™"});
	}

	return (
		<div>
			{
				chan.mode !== "invite_only" &&
				<section className="banned">
					<UserList
						title="Banned users"
						list={chan.bannedUsers}
						add={(value: UserType) => {
							if (value.id == "1")
								return addNotif({content: "You cannot ban yourself!"});
							else if (isInList("admins", value))
								return addNotif({content: "This user is an admin, please"
								+ " unadmin them before banning them."});
							rmFromList("allowed_users", value);
							addToList("banned_users", value);
						}}
						rm={(value: UserType) => {
							rmFromList("banned_users", value)
						}}
						owner={null}
					/>
				</section>
			}
			{
				chan.mode === "invite_only" &&
				<section className="allowed">
					<UserList
						title="Allowed users"
						list={chan.invitedUsers}
						add={(value: UserType) => {
							addToList("allowed_users", value);
							rmFromList("banned_users", value);
						}}
						rm={(value: UserType) => {
							if (isInList("admins", value))
								return addNotif({content: "This user is an admin, please"
									+ " unadmin them before taking them access."});
							rmFromList("admins", value);
							rmFromList("allowed_users", value);
						}}
						owner={chan.invitedUsers[0]}
					/>
				</section>
			}
			{/*
				<section className="admins">
					<UserList
						title="Admins"
						list={chan.admins}
						add={(value: UserType) => {
							if (chan.visibility == "public" && isInList("banned_users", value))
								return addNotif({content: "This user is banned, please unban"
									+ " them before making them admin."});
							rmFromList("banned_users", value);
							addToList("allowed_users", value);
							addToList("admins", value);
						}}
						rm={(value: UserType) => rmFromList("admins", value)}
						owner={chan.admins[0]}
					/>
				</section>
			*/}
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