export interface UserType {
	id: string,
	username: string,
	email: string,
	updated_at: string,
	created_at: string,
	profile: {
		id: string,
		firstName: string,
		lastName:string
	}
}

export interface UserPostType {
	username: string,
	email: string,
	profile: {
		firstName: string,
		lastName:string
	}
}

export interface FriendshipType {
	id: string,
	status1: string,
	status2: string,
	updated_at: string,
	created_at: string,
	user1: UserType,
	user2: UserType
}

export interface MyInfoType {
	logged: boolean,
	token: string
}

export interface MsgType {
	uid: number,
	username: string,
	content: string,
	date: string
}

export interface ChanType {
	id: string,
	name: string,
	size: number,
	msgs: MsgType[]
}