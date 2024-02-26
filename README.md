
# ft_transcendence

The last project of 42's common core program. We have to build a single page website with a functionnal chat and playable minigames (pong game for example).

We use NestJs and React there for.




## API Paths

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

__PROFILES__

૰ **@Put** `/users/:username/profile`

૰ **@Put** `/me/profile`

૰ **@Patch** `/users/:username/profile`

૰ **@Patch** `/me/profile`

૰ **@Delete** `/users/:username/profile`

૰ **@Delete** `/me/profile`

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

__FRONTEND__

`VITE_FTAPI_CLIENTID` = "<UID of 42School API>"

`FRONTEND_PORT` = 8080

__BACKEND__

`API_CLIENT_ID` = "<UID of 42School API>"

`API_SECRET` = "<SECRET KEY of 42School API>"

`BACKEND_PORT` = 3450

__DATABASE__

`POSTGRES_USER` = "name"

`POSTGRES_PASSWORD` = "Password"

`POSTGRES_DB` = "pong42"

`PGDATA` = "/var/lib/postgresql/data"

`DB_PORT` = 5432
