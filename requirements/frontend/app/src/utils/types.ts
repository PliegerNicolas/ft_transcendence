export interface ProfileType {
	id: string,
	firstName: string,
	lastName:string,
	picture: string,
	elo: number
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
	globalServerPrivileges: string,
}

export interface UserPostType {
	username: string,
	email: string,
	profile: {
		firstName: string,
		lastName:string
	}
}

interface UserStatus {
	user: UserType,
	status: string,
}

export interface FriendshipType {
	id: string,
	updated_at: string,
	created_at: string,
	userStatuses: UserStatus[],
}

export interface OldShip {
	id: string,
	updated_at: string,
	created_at: string,
	user1: UserType,
	user2: UserType,
	status1: string,
	status2: string,
}

export interface MyInfoType {
	logged: boolean,
}

export interface MemberType {
	id: string,
	role: "owner" | "operator" | "member",
	user: UserType,
	banned: boolean,
	invited: boolean,
	muted: boolean,
	active: boolean,
	muteDuration: string,
	mutedSince: string,
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
	activeMembers: Array<MemberType>,
	inactiveMembers: Array<MemberType>,
	bannedMembers: Array<MemberType>,
	invitedMembers: Array<MemberType>,
	mutedMembers: Array<MemberType>,
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

export interface User {
	id: number,
	username: string,
	accountname: string,
	createdAt: Date,
	updatedAt: Date,
	isTwoFactorAuthEnabled: boolean,
	relationships: []
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

export interface GamelogsType {
	id: bigint,
    gameType: GameType,
    gamelogToUsers: Array<GamelogToUsersType>
}

export interface GamelogToUsersType {
	id: bigint,
    result: GameResult;
    user: User;
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

export interface HttpErrorType {
	message: string,
	error: string,
	statusCode: number,
}