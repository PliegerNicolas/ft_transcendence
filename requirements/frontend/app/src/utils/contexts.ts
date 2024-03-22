import { createContext, Dispatch, SetStateAction } from "react";

import Api from "./Api";
import { ChanType, FriendshipType, UserType } from "./types";

export const FriendshipContext = createContext({
	id: "0",
	friendships: [] as FriendshipType[],
});

export const MyContext = createContext({
	logged: false,
	setLogged: (() => {}) as Function,
	api: new Api(`https://${location.hostname}:4433/api`),
	addNotif: (() => {}) as Function,
	addInvite: (() => {}) as Function,
	lastChan: "",
	setLastChan: (() => {}) as Function,
	setGlobalPopup: (() => {}) as Function,
	me: undefined as UserType | undefined,
});

export const ChatContext = createContext({
	showSidebar: 1,
	setShowSidebar: (() => {}) as Dispatch<SetStateAction<number>>,
});

export const ChatContentContext = createContext({
	chan: {} as ChanType,
	role: "member",
	idMap: {} as {[memberId: string]: number},
	dmName: "",
});