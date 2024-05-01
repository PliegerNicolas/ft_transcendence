
# ft_transcendence

The last project of 42's common core program. We have to build a single page website with a functionnal chat and playable minigames (pong game for example).

We use NestJs and React there for.

/!\ If you're a 42 student, do not copy this project. First of all it would be detrimental to your education but it's also an old subject.


## API Paths

__AUTH__

૰ **@Post** `/auth`
{
	'code' : <code from 42 API>
	'redirect_uri' : <url that called the /auth>
}

૰ **@Post** `/auth/logout`

૰ **@Post** `/auth/log_as`
Only use for debug purposes

૰ **@Get** `/auth/refresh`

__2FA__
૰ **@Post** `/2fa/generate`


૰ **@Post** `/2fa/turn-on`
{
	'twoFactorAuthCode': <code from user's 2fa app>
}

૰ **@Post** `/2fa/turn-off`

૰ **@Post** `/2fa/authenticate`
{
	'twoFactorAuthCode': <code from user's 2fa app>
}

__USERS__

૰ **@Get** `/users`

૰ **@Get** `/users/:username`

૰ **@Get** `/me`

૰ **@Post** `/users`

૰ **@Put** `/users/:username`

૰ **@Put** `/me`

૰ **@Patch** `/users/:username`

૰ **@Patch** `/me`

૰ **@Delete** `/users/:username`

૰ **@Delete** `/me`

Example general purpose body:
```
{
    "email": "foo@example.com",
    "username": "foo",
    "oauthId": 1,
    "profile": {
        "firstName": "Foo",
        "lastName": "bar"
    }
}
```

__USER PICTURES__

૰ **@Get** `/users/:username/picture`

૰ **@Get** `/picture`

૰ **@Post** `/users/:username/picture`

૰ **@Post** `/picture`

૰ **@Put** `/users/:username/picture`

૰ **@Put** `/picture`

૰ **@Delte** `/users/:username/picture`

૰ **@Delete** `/picture`

Example general purpose body:
```
form-data {
    "picture": File > 'Screenshot from ...'
}
```

__PROFILES__

૰ **@Put** `/users/:username/profile`

૰ **@Put** `/profile`

૰ **@Patch** `/users/:username/profile`

૰ **@Patch** `/profile`

૰ **@Delete** `/users/:username/profile`

૰ **@Delete** `/profile`

Example general purpose body:
```
{
    "firstName": "Foo",
    "lastName": "bar"
}
```

__RELATIONSHIPS__

૰ **@Get** `/users/:username/relationships`

૰ **@Get** `/relationships`

૰ **@Get** `/users/:username/relationships/:targetUsername`

૰ **@Get** `/relationships/:targetUsername`

૰ **@Post** `/users/:username/relationships`

૰ **@Post** `/relationships`

૰ **@Put** `/users/:username/relationships/:targetUsername`

૰ **@Put** `/relationships/:targetUsername`

૰ **@Patch** `/users/:username/relationships/:targetUsername`

૰ **@Patch** `/relationships/:targetUsername`

૰ **@Delete** `/users/:username/relationships/:targetUsername`

૰ **@Delete** `/relationships/:targetUsername`

Example general purpose body:
```
{
    "username": "Foo",
    "status": "accepted"
}
```

__GAMELOGS__

૰ **@Get** `/all_gamelogs`

૰ **@Get** `/users/:username/gamelogs`

૰ **@Get** `/gamelogs`

૰ **@Get** `/gamelogs/:gamelogId`

૰ **@Post** `/gamelogs`

૰ **@Put** `/gamelogs/:gamelogId`

૰ **@Patch** `/gamelogs/:gamelogId`

૰ **@Delete** `/gamelogs/:gamelogId`

Example general purpose body:
```
{
    "userResults": [
        { "username": "Foo", "result": "victory" },
        { "username": "Bar", "result": "defeat" }  
    ],
    "gameType": "pong"
}
```

__CHANNELS__

૰ **@Get** `/users/:username/channels`

૰ **@Get** `/channels`

૰ **@Get** `/users/:username/channels/:channelId`

૰ **@Get** `/channels/:channelId`

૰ **@Post** `/users/:username/channels`

૰ **@Post** `/channels`

૰ **@Put** `/users/:username/channels/:channelId`

૰ **@Put** `/channels/:channelId`

૰ **@Patch** `/users/:username/channels/:channelId`

૰ **@Patch** `/channels/:channelId`

૰ **@Patch** `/users/:username/channels/:channelId/join`

૰ **@Patch** `/channels/:channelId/join`

૰ **@Patch** `/users/:username/channels/:channelId/leave`

૰ **@Patch** `/channels/:channelId/leave`

૰ **@Patch** `/users/:username/channels/:channelId/manage_access`

૰ **@Patch** `/channels/:channelId/manage_access`

૰ **@Delete** `/users/:username/channels/:channelId`

૰ **@Delete** `/channels/:channelId`

Example general purpose body for channel:
```
{
    "name": "Channel",
    "visibility": "public",
    "mode": "password_protected",
    "password": "Password123"
}
```

Example general purpose body for manage_access:
```
{
    "action": "invite",
    "usernames": ["Foo", "Bar"]
}
```

__MESSAGES__

૰ **@Get** `/users/:username/channels/:channelId/messages`

૰ **@Get** `/channels/:channelId/messages`

૰ **@Get** `/users/:username/channels/:channelId/message/:messageId`

૰ **@Get** `/channels/:channelId/message/:messageId`

૰ **@Post** `/users/:username/channels/:channelId/messages`

૰ **@Post** `/channels/:channelId/messages`

૰ **@Put** `/users/:username/channels/:channelId/messages/:messageId`

૰ **@Put** `/channels/:channelId/messages/:messageId`

૰ **@Patch** `/users/:username/channels/:channelId/messages/:messageId`

૰ **@Patch** `/channels/:channelId/messages/:messageId`

૰ **@Delete** `/users/:username/channels/:channelId/messages/:messageId`

૰ **@Delete** `/channels/:channelId/messages/:messageId`

Example general purpose body:
```
{
    "content": "Bonjour"
}
```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in the ./srcs folder.

```
#NGINX
DOMAIN_NAME="localhost"

#FRONTEND

#BACKEND

#DATABASE

DB_USER="VJpQU75G2yMAJ2DxFrjugmCdEksXBwhj"
DB_PASSWORD="mOgjYgmZgvHQQMU0rZsdPOobfqHEGjbW"
DB_NAME="pong42"

#42API

API42_CLIENT_ID="u-s4t2ud-..."
API42_SECRET="s-s4t2ud-..."

```
