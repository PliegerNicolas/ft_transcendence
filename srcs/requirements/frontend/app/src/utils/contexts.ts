import {createContext} from "react";

import { FriendshipType } from "./types";

interface FriendshipContextType {
	id: string,
	friendships: FriendshipType[],
	action: Function
}

export const FriendshipContext = createContext(
	{id: "0", friendships: [], action: () => {}} as FriendshipContextType
);