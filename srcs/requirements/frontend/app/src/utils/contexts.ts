import { createContext, Dispatch, SetStateAction } from "react";

import { FriendshipType, ChanType } from "./types";

interface FriendshipContextType {
	id: string,
	friendships: FriendshipType[],
	action: Function
}

export const FriendshipContext = createContext({
	id: "0",
	friendships: [],
	action: () => {}
} as FriendshipContextType);

export const MyContext = createContext({
	logged: false,
	token: ""
});

interface ChatContextType {
	showSidebar: number,
	setShowSidebar: Dispatch<SetStateAction<number>>,
	chanList: ChanType[]
}

export const ChatContext = createContext({
	showSidebar: 1,
	setShowSidebar: () => {},
	chanList: [],
} as ChatContextType);