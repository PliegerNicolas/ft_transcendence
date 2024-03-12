export interface ProfileType {
	id: string,
	firstName: string,
	lastName:string,
	picture: string,
}

export interface UserType {
	id: string,
	username: string,
	email: string,
	updated_at: string,
	created_at: string,
	picture: string,
	profile: ProfileType,
	isTwoFactorAuthEnabled: boolean,
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

export interface MemberType {
	id: string,
	mute: boolean,
	role: "owner" | "operator" | "member",
	user: UserType,
}

export interface MsgType {
	id: string
	channelId: string,
	content: string,
	createdAt: string,
	channelMember: MemberType
}

export interface ChanType {
	id: string,
	name: string,
	mode: string,
	password: string | undefined,
	passwordRepeat: string | undefined,
	visibility: string,
	membersCount: number,
	members: Array<MemberType>,
	bannedUsers: Array<UserType>,
	invitedUsers: Array<UserType>,
	mutedUsers: Array<UserType>,
}

export interface ChanSpecsType {
	isMember: boolean,
	role: string,
	channel: ChanType,
}

export interface ChanFormType {
	name: string,
	visibility: string,
	mode: string,
	password: string,
	passwordRepeat: string,
}

export interface NotifType {
	date: number,
	content: string,
	type: number,
	id: string,
}

export interface InviteType {
	lobby: string,
	from: string
}

export enum GameResult {
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    TIE = 'tie',
}

export enum GameType {
    PONG = "pong",
    UNDEFINED = "undefined",
}

export interface GamelogPostType {
	userResults: [
        { username: string, result: GameResult },
        { username: string, result: GameResult }
	],
    gameType: GameType
}

export interface PopupType {
	title: string,
	text: JSX.Element,
	action: string,
	cancelFt: Function,
	actionFt: Function
}

export interface MessagePayloads {
	content: string,
	channel: string,
}