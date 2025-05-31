# BoiBritto API Docs

### Frontend payload format
Wrap the payload inside `data` object, fields inside the payload `data` will vary depending on the route ( see endpoints doc below for respective  payload data fields )
```json
{
    "data": {
        "volumeId": "...",
        "status": "...",
        // ...
    }
}
```

### API Response Format

```json
{
    "success": true/false, // whether the operation succeeded or not
    "message": "...", // short helper message to what succeeded / failed
    "data": {
        // ... send data back ... ( if applicable )
    }
}
```


<br>

## Auth Routes

```
POST   /api/auth/login
```

Logs in the user using Google account via Firebase Auth service.

<br>

```
POST   /api/auth/signup
```

Signs up the user (after first login, add some profile info).

<br>

```
POST   /api/auth/logout
```

Logs out the current user.

---

## User Routes

### Currently Logged-in User (`/api/users/me`)

```
GET    /api/users/me/dashboard
```

Get dashboard data.

<br>

```
GET    /api/users/me/profile
```

View own profile.

<br>

```
PATCH  /api/users/me/profile
```

Update profile data.

<br>

#### Collections

```
GET    /api/users/me/collections
```

Get all collections of the current user.

<br>

```
POST   /api/users/me/collections
```

Create a new collection.

<br>

```
GET    /api/users/me/collections/:id
```

View specific collection.

<br>

```
PATCH  /api/users/me/collections/:id
```

Update specific collection.

<br>

```
DELETE /api/users/me/collections/:id
```

Delete specific collection.

<br>

#### Reading List

```
GET    /api/users/me/reading-list
```

Get current user's reading list.

<br>

```
POST   /api/users/me/reading-list
```

Add a book to reading list (provide volumeId and status in request body).

<br>

```
PATCH  /api/users/me/reading-list/:volumeId
```

Update reading status or dates for a book.

<br>

```
DELETE /api/users/me/reading-list/:volumeId
```

Remove a book from reading list.

<br>

#### Blogs

```
GET    /api/users/me/blogs
```

View list of own blogs.

<br>

```
POST   /api/users/me/blogs
```

Create a new blog.

<br>

```
GET    /api/users/me/blogs/:id
```

View a specific blog.

<br>

```
PATCH  /api/users/me/blogs/:id
```

Edit a specific blog.

<br>

```
DELETE /api/users/me/blogs/:id
```

Delete a specific blog.

<br>

#### Discussions

```
GET    /api/users/me/discussions
```

View list of own discussions.

```
POST   /api/users/me/discussions
```

Create/start a new discussion.

```
GET    /api/users/me/discussions/:id
```

View specific discussion.

```
PATCH  /api/users/me/discussions/:id
```

Update discussion.

```
DELETE /api/users/me/discussions/:id
```

Delete discussion.

---

## Other User Routes

### Public User Content

```
GET /api/users/:userId/profile
```

View public profile info (username, display name, bio, avatar).

```
GET /api/users/:userId/reading-list
```

View public portion of another user's reading list.

```
GET /api/users/:userId/collections
```

View all public collections of a user.

```
GET /api/users/:userId/collections/:collectionId
```

View specific public collection.

```
GET /api/users/:userId/discussions
```

View list of another user's discussions.

```
GET /api/users/:userId/discussions/:discussionId
```

View a specific public discussion.

Optional query parameters:

```
GET /api/users/:userId/collections?tag=horror
GET /api/users/:userId/discussions?sort=latest
```

---

## Public Collections

```
GET /api/collections/:id
```

View any public collection.

---

## Discussion Routes

```
GET    /api/discussions/:id
```

View a discussion thread.

```
POST   /api/discussions/:id/comments
```

Add a comment to a discussion.

```
GET    /api/discussions/:id/comments
```

Get all comments under a discussion.

```
DELETE /api/comments/:commentId
```

Delete own comment.

---

## Reading List Routes

### User-Oriented

```
GET    /api/users/me/reading-list
POST   /api/users/me/reading-list
PATCH  /api/users/me/reading-list/:volumeId
DELETE /api/users/me/reading-list/:volumeId
```

### Book-Oriented

```
POST   /api/books/:volumeId/reading-status
GET    /api/books/:volumeId/reading-status
DELETE /api/books/:volumeId/reading-status
```

---

> Note: This is an initial draft. API endpoint details, parameters, response data and authentication/authorization checks will be expanded and updated as the project evolves.


