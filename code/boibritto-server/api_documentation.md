# BoiBritto API Documentation

### Frontend Payload Format

Wrap the payload inside a `data` object. Fields inside the payload `data` will vary depending on the route.

```json
{
  "data": {
    "volumeId": "...",
    "status": "..."
  }
}
```

### API Response Format

```json
{
  "success": true/false,
  "message": "...",
  "data": {
    // optional response data
  }
}
```

---

# Endpoints

## Auth Routes

### Login User

**GET** `/api/auth/login`

Log the user in via Firebase ID Token, if this is the first time user is logging in, `newUser` is set to `true`, redirect to signup page in that case to register the account.

#### Headers:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### Response (if user exists):

```json
{
  "success": true,
  "message": "User login successful",
  "data": {
    "newUser": false,
    "user": {
      "_id": "665be...",
      "uid": "55eO2tO...",
      "email": "raiyanmuhtasim@gmail.com",
      "displayName": "Raiyan",
      "avatar": "https://lh3.googleusercontent.com/...",
      "username": "raiyan123",
      "bio": "I love reading sci-fi and writing fiction.",
      "interestedGenres": ["Sci-fi", "Fantasy"],
      "createdAt": "2025-06-02T10:10:15.123Z",
      "updatedAt": "2025-06-02T10:10:15.123Z",
      "__v": 0
    }
  }
}
```

#### Response (if user is new, first time login, redirect to signup page):

```json
{
  "success": true,
  "message": "User login successful",
  "data": {
    "newUser": true,
    "user": null
  }
}
```

---
### Signup User

**POST** `/api/auth/signup`

ask for a unique username for the platform, interestedGenre (genre list given in schema doc) and user bio of max 500 characters

#### Headers:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

#### Request Body:
`req.user` attached by Firebase\
`req.body`:
```json
{
  "username": "raiyan123",
  "bio": "I love reading sci-fi and writing fiction.",
  "interestedGenres": ["Sci-fi", "Fantasy"]
}
```

#### Response:

```json
{
  "success": true,
  "message": "User account created successfully",
  "data": {
    "user": {
      "_id": "665be7481a3e28b6e447c02c",
      "uid": "55eO2tOleXeVmvcMucGHkrSgTVa2",
      "email": "raiyanmuhtasim@gmail.com",
      "displayName": "Raiyan",
      "avatar": "https://lh3.googleusercontent.com/...",
      "username": "raiyan123",
      "bio": "I love reading sci-fi and writing fiction.",
      "interestedGenres": ["Sci-fi", "Fantasy"],
      "createdAt": "2025-06-02T10:10:15.123Z",
      "updatedAt": "2025-06-02T10:10:15.123Z",
      "__v": 0
    }
  }
}
```

#### Error Response (User already exists):

```json
{
  "success": false,
  "message": "User already exists",
  "error": null
}
```

---

## User Routes

### Get Dashboard Data

**GET** `/api/users/me/dashboard`

* **Input**:
* **Response**:

### View Own Profile

**GET** `/api/users/me/profile`

* **Input**:
* **Response**:

### Update Own Profile

**PATCH** `/api/users/me/profile`

* **Input**: `req.body.data`
* **Response**:

## Collections

### Get Own Collections

**GET** `/api/users/me/collections`

* **Input**:
* **Response**:

### Create a Collection

**POST** `/api/users/me/collections`

* **Input**: `req.body.data`
* **Response**:

### View a Collection

**GET** `/api/users/me/collections/:id`

* **Input**: `:id` as route param
* **Response**:

### Update a Collection

**PATCH** `/api/users/me/collections/:id`

* **Input**: `:id` as route param, `req.body.data`
* **Response**:

### Delete a Collection

**DELETE** `/api/users/me/collections/:id`

* **Input**: `:id` as route param
* **Response**:

## Reading List

### Get Reading List

**GET** `/api/users/me/reading-list`

* **Input**:
* **Response**:

### Add to Reading List

**POST** `/api/users/me/reading-list`

* **Input**: `req.body.data.volumeId`, `req.body.data.status`
* **Response**:

### Update Reading List Entry

**PATCH** `/api/users/me/reading-list/:volumeId`

* **Input**: `:volumeId` as route param, `req.body.data`
* **Response**:

### Remove from Reading List

**DELETE** `/api/users/me/reading-list/:volumeId`

* **Input**: `:volumeId` as route param
* **Response**:

## Blogs


### View Own Blogs

**GET** `/api/users/me/blogs`

* **Input**:
* **Response**:

### Create a Blog

**POST** `/api/users/me/blogs`

* **Input**: `req.body.data`
* **Response**:

### View a Blog

**GET** `/api/users/me/blogs/:id`

* **Input**: `:id` as route param
* **Response**:

### Edit a Blog

**PATCH** `/api/users/me/blogs/:id`

* **Input**: `:id` as route param, `req.body.data`
* **Response**:

### Delete a Blog

**DELETE** `/api/users/me/blogs/:id`

* **Input**: `:id` as route param
* **Response**:

## Discussions

### View Own Discussions

**GET** `/api/users/me/discussions`

* **Input**:
* **Response**:

### Start a Discussion

**POST** `/api/users/me/discussions`

* **Input**: `req.body.data`
* **Response**:

### View a Discussion

**GET** `/api/users/me/discussions/:id`

* **Input**: `:id` as route param
* **Response**:

### Update a Discussion

**PATCH** `/api/users/me/discussions/:id`

* **Input**: `:id` as route param, `req.body.data`
* **Response**:

### Delete a Discussion

**DELETE** `/api/users/me/discussions/:id`

* **Input**: `:id` as route param
* **Response**:

---

## Other User Routes

### Public Profile Info

**GET** `/api/users/:userId/profile`

* **Input**: `:userId` as route param
* **Response**:

### Public Reading List

**GET** `/api/users/:userId/reading-list`

* **Input**: `:userId` as route param
* **Response**:

### Public Collections List

**GET** `/api/users/:userId/collections`

* **Input**: `:userId` as route param
* **Query Params**: `?tag=horror`
* **Response**:

### Public Collection Detail

**GET** `/api/users/:userId/collections/:collectionId`

* **Input**: `:userId`, `:collectionId` as route params
* **Response**:

### Public Discussions List

**GET** `/api/users/:userId/discussions`

* **Input**: `:userId` as route param
* **Query Params**: `?sort=latest`
* **Response**:

### Public Discussion Detail

**GET** `/api/users/:userId/discussions/:discussionId`

* **Input**: `:userId`, `:discussionId` as route params
* **Response**:

---

## Public Collections

### View a Public Collection

**GET** `/api/collections/:id`

* **Input**: `:id` as route param
* **Response**:

---

## Discussion Routes

### View a Discussion Thread

**GET** `/api/discussions/:id`

* **Input**: `:id` as route param
* **Response**:

### Add Comment to Discussion

**POST** `/api/discussions/:id/comments`

* **Input**: `:id` as route param, `req.body.data`
* **Response**:

### Get Comments for Discussion

**GET** `/api/discussions/:id/comments`

* **Input**: `:id` as route param
* **Response**:

### Delete a Comment

**DELETE** `/api/comments/:commentId`

* **Input**: `:commentId` as route param
* **Response**:

---

## Reading List Routes (Alternate Book-Oriented)

### Add/Update Reading Status by Book

**POST** `/api/books/:volumeId/reading-status`

* **Input**: `:volumeId` as route param, `req.body.data`
* **Response**:

### Get Reading Status for Book

**GET** `/api/books/:volumeId/reading-status`

* **Input**: `:volumeId` as route param
* **Response**:

### Remove Reading Status for Book

**DELETE** `/api/books/:volumeId/reading-status`

* **Input**: `:volumeId` as route param
* **Response**:

---

> This document is a work in progress. Details such as parameters, response schemas, and validation rules will be updated as development continues.
