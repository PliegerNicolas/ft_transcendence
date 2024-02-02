# ft_transcendence

### .env template (./srcs/.env)

```
#POSTGRESQL
POSTGRES_USER=my_username
POSTGRES_PASSWORD=my_password
POSTGRES_DB=my_db
PGDATA=/var/lib/postgresql/data

#VITEJS
VITE_FTAPI_CLIENTID="u-s4t2ud-etc..."

#NESTJS
API_CLIENT_ID="<UID>"
API_SECRET = "<SECRET>"
```

### Nest.js & API's paths

@Users
- `GET` ⇒ `/users` : *This lists all Users.*
- `GET` ⇒ `/users/{:userId}` : *This lists the target User and it's profile.*
- `POST` ⇒ `/users` : *This creates a new User and a new Profile. (cf. CreateUser.dto.ts)*
- `PUT` ⇒ `/users/{:userId}` : *This modifies the target User and/or it's Profile, asking for a complete alteration. (cf. ReplaceUser.dto.ts)*
- `PATCH` ⇒ `/users/{:userId}` : *This modifies the target User and/or it's Profile, asking for a partial or complete alteration. (cf. UpdateUser.dto.ts)*
- `DELETE` ⇒ `/users/{:userId}` : *This deletes the target User, it's Profile and Relationships.*

@Profiles
- `GET` ⇒ `/users/{:userId}/profile` : *This lists the User's Profile.*
- `PUT` ⇒ `/users/{:userId}/profile` : *This modifies the target Profile, asking for a complete alteration. (cf. ReplaceProfile.dto.ts)*
- `PATCH` ⇒ `/users/{:userId}/profile` : *This modifies the target Profile, asking for a partial or complete alteration. (cf. UpdateProfile.dto.ts)*

@Relationships
- `GET` ⇒ `/users/{:userId}/relationships` : *This lists all Users's Relationships.*
- `GET` ⇒ `/users/{:userId}/relationships/{:targetId}` : *This lists the Relationship the User shares with the Target*
- `POST` ⇒ `/users/{:userId}/relationships` : *This creates a new Relationship between two users. (cf. CreateRelationship.dto.ts)*
- `PUT` ⇒ `/users/{:userId}/relationships/{:targetId}` : *This modifies the Relationship set between the two Users, asking for a complete alteration. (cf. ReplaceRelationship.dto.ts)*
- `PATCH` ⇒ `/users/{:userId}/relationships/{:targetId}` : *This modifies the Relationship set between the two Users, asking for a partial or complete alteration. (cf. UpdateRelationship.dto.ts)*
- `DELETE` ⇒ `/users/{:userId}/relationships/{:targetId}` : *This delete the Relationship set between the two Users.*

@Gamelogs
- `GET` ⇒ `/gamelogs` : *This lists all the existing gamelogs.*
- `GET` ⇒ `/users/{:userId}/gamelogs` : *This lists all Users's Gamelogs.*
- `POST` ⇒ `/gamelogs` : *This creates a new Gamelog by passing a list of userIds, of results and a game type. (cf. CreateGamelog.dto.ts)*
- `PUT` ⇒ `/gamelogs/{:id}` : *This modifies the Gamelog set, asking for a complete alteration. (cf. ReplaceGamelog.dto.ts)*
- `PATCH` ⇒ `/gamelogs/{:id}` : *This modifies the Gamelog set between the two Users, asking for a partial or complete alteration. (cf. UpdateGamelog.dto.ts)*
- `DELETE` ⇒ `/gamelogs/{:id}` : *This delete the Gamelog.*

@Channels
- `GET` ⇒ `/channels` : *This lists all the existing channels.*
- `GET` ⇒ `/users/{:userId}/channels` : *This lists all Users's Channels.*
- `POST` ⇒ `/users/{:userId}/channels` : *This creates a new Channel. (cf. CreateChannel.dto.ts)*
- `PUT` ⇒ `/channels/{:id}` : *This modifies the Channel set, asking for a complete alteration. (cf. ReplaceGamelog.dto.ts)*
- `PATCH` ⇒ `/channels/{:id}` : *This modifies the Channel set between the two Users, asking for a partial or complete alteration. (cf. UpdateGamelog.dto.ts)*
- `DELETE` ⇒ `/gamelogs/{:id}` : *This delete the Gamelog.*
- `PATCH` ⇒ `/users/{:userId}/channels/${:channelId}/join` : *This makes the user join a channel.*
- `PATCH` ⇒ `/users/{:userId}/channels/${:channelId}/leave` : *This makes the user leave a channel.*

@Messages
- `GET` ⇒ `/users/{:userId}/channels/{:channelId}/messages` : *This lists all the existing channel messages.*
- `GET` ⇒ `/users/{:userId}/channels/{:channelId}/messages/{:messageId}` : *This lists the target existing message in channel.*
- `PUT` ⇒ `/channels/{:id}` : *This modifies the Channel set, asking for a complete alteration. (cf. ReplaceGamelog.dto.ts)*
- `POST` ⇒ `/users/{:userId}/channels/{:channelId}/messages` : *This creates a new message. (cf. CreateMessage.dto.ts)*
- `PATCH` ⇒ `/users/{:userId}/channels/{:channelId}/messages` : *This creates a new message. (cf. CreateMessage.dto.ts)*
- `PUT` ⇒ `/users/{:userId}/channels/{:channelId}/messages/{:messageId}` : *This modifies the target Message, asking for a complete alteration. (cf. ReplaceMessage.dto.ts)*
- `PATCH` ⇒ `/users/{:userId}/channels/{:channelId}/messages/{:messageId}` : *This modifies the target Message, asking for a partial or complete alteration. (cf. UpdateMessage.dto.ts)*
- `DELETE` ⇒ `/users/{:userId}/channels/{:channelId}/messages/{:messageId}` : *This delete the target Message.*

