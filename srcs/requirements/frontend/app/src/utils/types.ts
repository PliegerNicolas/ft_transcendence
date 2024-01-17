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