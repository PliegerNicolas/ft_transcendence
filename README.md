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
- `POST` ⇒ `/users` : *This creates a new Relationship between two users. (cf. CreateRelationship.dto.ts)*
- `PUT` ⇒ `/users/{:userId}` : *This modifies the Relationship set between the two Users, asking for a complete alteration. (cf. ReplaceRelationship.dto.ts)*
- `PATCH` ⇒ `/users/{:userId}` : *This modifies the Relationship set between the two Users, asking for a partial or complete alteration. (cf. UpdateRelationship.dto.ts)*
