# API Endpoints Documentation

### Frontend Payload Format

**All request payload data must be wrapped inside `data` object (req.body.data)**\
Ex-
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

<br>

<br>

## API Routes:

- #### [Auth](#auth-routes)
- #### [Profile](#profile-routes)
- #### [Collections](#collection-routes)
- #### [Reading List](#reading-list-routes)
- #### [Blogs](#blog-routes)
- #### [Discussions](#discussion-routes)
- #### [Comments](#comment-routes)
- #### [User Books](#user-books-routes)


---

## Auth Routes

### Login User

**GET** `/api/auth/login`

Logs in a user using a Firebase ID token. If the user does not yet exist in the database, it returns `newUser: true` and the client should redirect to the signup flow.

#### Headers

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### Behavior

* Validates Firebase ID token.
* If the user exists in the database, returns their information.
* If the user does not exist, returns `newUser: true`.

#### Success Response (existing user)

```json
{
  "success": true,
  "message": "User login successful",
  "data": {
    "newUser": false,
    "user": {
      "_id": "665be...",
      "uid": "55eO2tO...",
      "email": "raiyan@gmail.com",
      "displayName": "Raiyan",
      "avatar": "https://lh3.googleusercontent.com/...",
      "username": "raiyan123",
      "bio": "I love reading sci-fi and writing fiction.",
      "interestedGenres": ["sci-fi", "fantasy"],
      "createdAt": "2025-06-02T10:10:15.123Z",
      "updatedAt": "2025-06-02T10:10:15.123Z",
      "__v": 0
    }
  }
}
```

#### Success Response (new user)

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

Registers a new user with a unique username, bio, and list of interested genres. Must be called only if the login endpoint returns `newUser: true`.

#### Headers

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

#### Request Body

`req.body.data`

```json
{
  "username": "raiyan123",
  "bio": "I love reading sci-fi and writing fiction.",
  "interestedGenres": ["sci-fi", "fantasy"]
}
```

#### Behavior

* Validates Firebase ID token.
* Checks for an existing user.
* If not found, creates a new user with additional fields from the request.

#### Success Response

```json
{
  "success": true,
  "message": "User account created successfully",
  "data": {
    "user": {
      "_id": "665be7...",
      "uid": "55eO2t...",
      "email": "raiyan@gmail.com",
      "displayName": "Raiyan",
      "avatar": "https://lh3.googleusercontent.com/...",
      "username": "raiyan123",
      "bio": "I love reading sci-fi and writing fiction.",
      "interestedGenres": ["sci-fi", "fantasy"],
      "createdAt": "2025-06-02T10:10:15.123Z",
      "updatedAt": "2025-06-02T10:10:15.123Z",
      "__v": 0
    }
  }
}
```

#### Error Response (user already exists)

```json
{
  "success": false,
  "message": "User already exists",
  "error": null
}
```
---

## Profile Routes

### Get Current User's Profile

**GET** `/api/profile/me`

**Behavior:**

* Returns minimal preview data related to the currently authenticated user, including:
  * User profile data
  * Up to 5 most recent collections
  * Up to 5 most recent reading tracker items
  * Up to 5 most recent blogs

**Headers:**

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile data fetched successfully",
  "data": {
    "profile_data": { /* User profile data */ },
    "collections": [ /* Array of collections */ ],
    "reading_tracker": [ /* Array of reading list items */ ],
    "blogs": [ /* Array of blogs */ ]
  }
}
```
<br>

Sample response:
```json
{
  "success": true,
  "message": "Profile data fetched successfully",
  "data": {
    "profile_data": {
      "_id": "6843292c5cc2e9ee0b9bc0a9",
      "email": "test@example.com",
      "username": "test",
      "displayName": "TestUser",
      "bio": "Im a test user",
      "avatar": "Dummy avatar",
      "interestedGenres": ["fiction"],
      "createdAt": "2025-06-06T17:45:16.747Z",
      "updatedAt": "2025-06-06T17:45:16.747Z"
    },
    "collections": [
      {
        "_id": "68445fbc6a03d373c39b9031",
        "title": "Test Collection",
        "description": "This is a test collection",
        "visibility": "public",
        "createdAt": "2025-06-07T15:50:20.549Z",
        "updatedAt": "2025-06-11T18:55:06.626Z"
      }
    ],
    "reading_tracker": [
      {
        "_id": "68544cd26b3874a436296d28",
        "volumeId": "book-id-1",
        "status": "completed",
        "visibility": "public",
        "createdAt": "2025-06-19T17:45:54.156Z",
        "updatedAt": "2025-06-19T17:45:54.156Z"
      }
    ],
    "blogs": [
      {
        "_id": "6847133861841477d982ac22",
        "title": "My Second Blog!",
        "visibility": "public",
        "spoilerAlert": false,
        "genres": [],
        "createdAt": "2025-06-09T17:00:40.091Z",
        "updatedAt": "2025-06-09T17:21:56.138Z"
      },
      {
        "_id": "6847144261841477d982ac2f",
        "title": "My First Blog!",
        "visibility": "public",
        "spoilerAlert": false,
        "genres": [],
        "createdAt": "2025-06-09T17:05:06.094Z",
        "updatedAt": "2025-06-09T17:05:06.094Z"
      }
    ]
  }
}
```

---

### Update Current User's Profile

**PATCH** `/api/profile/me`

**Behavior:**

* Allows the authenticated user to update their profile information.
* Only `username`, `bio`, and `interestedGenres` can be modified.
* All fields are optional - you can update one or multiple fields in a single request.

**Headers:**

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

**Input:** `req.body.data`

```json
{
  "username": "new_username",
  "bio": "Updated bio text",
  "interestedGenres": ["sci-fi", "fantasy", "mystery"]
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": { /* Updated user profile data */ }
  }
}
```

<br>

Sample request:
```json
{
  "data": {
    "username": "bookworm123",
    "bio": "Passionate reader and book reviewer",
    "interestedGenres": ["fiction", "mystery", "biography"]
  }
}
```

Sample response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "_id": "6843292c5cc2e9ee0b9bc0a9",
      "uid": "55eO2tO...",
      "email": "test@example.com",
      "username": "bookworm123",
      "displayName": "TestUser",
      "bio": "Passionate reader and book reviewer",
      "avatar": "Dummy avatar",
      "interestedGenres": ["fiction", "mystery", "biography"],
      "createdAt": "2025-06-06T17:45:16.747Z",
      "updatedAt": "2025-06-26T10:30:45.123Z"
    }
  }
}
```

---

### Get User's Public Profile

**GET** `/api/profile/:userID`

**Behavior:**

* Returns minimal preview data of a specific user's **public** content only, including:
  * Non-sensitive profile data (excludes email, firebase uid)
  * Up to 5 most recent **public** collections
  * Up to 5 most recent **public** reading tracker items
  * Up to 5 most recent **public** blogs

**Headers:**

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Response Format:**

```json
{
  "success": true,
  "message": "User profile data fetched successfully",
  "data": {
    "profile_data": { /* Public user profile data */ },
    "collections": [ /* Array of public collections */ ],
    "reading_tracker": [ /* Array of public reading list items */ ],
    "blogs": [ /* Array of public blogs */ ]
  }
}
```

<br>

Sample response:
```json
{
  "success": true,
  "message": "User profile data fetched successfully",
  "data": {
    "profile_data": {
      "_id": "6843292c5cc2e9ee0b9bc0a9",
      "username": "bookworm",
      "displayName": "Book Lover",
      "bio": "Passionate about sci-fi and fantasy novels",
      "avatar": "https://lh3.googleusercontent.com/...",
      "interestedGenres": ["sci-fi", "fantasy", "mystery"],
      "createdAt": "2025-06-06T17:45:16.747Z",
      "updatedAt": "2025-06-20T10:30:45.123Z"
    },
    "collections": [
      {
        "_id": "68445fbc6a03d373c39b9031",
        "title": "Best Sci-Fi Books",
        "description": "My favorite science fiction novels",
        "visibility": "public",
        "createdAt": "2025-06-07T15:50:20.549Z",
        "updatedAt": "2025-06-11T18:55:06.626Z"
      }
    ],
    "reading_tracker": [
      {
        "_id": "68544cd26b3874a436296d28",
        "volumeId": "book-id-5",
        "status": "completed",
        "visibility": "public",
        "createdAt": "2025-06-19T17:45:54.156Z",
        "updatedAt": "2025-06-19T17:45:54.156Z"
      }
    ],
    "blogs": [
      {
        "_id": "6847133861841477d982ac22",
        "title": "Why I Love Science Fiction",
        "visibility": "public",
        "spoilerAlert": false,
        "genres": ["sci-fi"],
        "createdAt": "2025-06-09T17:00:40.091Z",
        "updatedAt": "2025-06-09T17:21:56.138Z"
      }
    ]
  }
}
```


---

## Collection Routes

### List Collections

**GET** `/api/collections`

**Query Parameters (optional):**

* `owner=me` — Fetch collections belonging to the current authenticated user.
* `owner=<uid>` — Fetch public collections of the specified user.
* `search=<query>` — Search collections by title (case insensitive).

**Behavior:**

* No `owner` param → Return all **public** collections (sorted by most recent, paginated 20 per page).
* `owner=me` → Return **all** collections of the authenticated user (private + public).
* `owner=<uid>` → Return **public** collections of the specified user.
* `search=<query>` → Search collections by title (case insensitive). Returns paginated results, 20 per page if multiple matches found. Can be combined with `owner` parameter.

**Response Format:**

```json
{
  "success": true,
  "message": "Collections fetched successfully",
  "data": {
    "collections": [ /* Array of collection objects */ ]
  }
}
```
<br>

Sample response:
```json
{
    "success": true,
    "message": "Collections fetched successfully",
    "data": {
        "collections": [
            {
                "_id": "683f1f3c250888a671a2cfe3",
                "user": {
                    "_id": "683f1f1c250888a671a2cfe0",
                    "username": "raiyan",
                    "displayName": "Raiyan",
                    "avatar": "https://lh3.googleusercontent.com/a/ACg8ocLbn..."
                },
                "title": "Best Horror stories",
                "description": "So scary you'll pee your pants",
                "books": [],
                "tags": [],
                "visibility": "public",
                "createdAt": "2025-06-03T16:13:48.542Z",
                "updatedAt": "2025-06-03T16:13:48.542Z",
                "__v": 0
            }
        ]
    }
}
```

---

### Create a Collection

**POST** `/api/collections`

**Input:** `req.body.data`

```json
{
  "title": "My Book List",
  "description": "Books I love to recommend",
  "books": [
    { "volumeId": "google-book-id-1" },
    { "volumeId": "google-book-id-2" }
  ],
  "visibility": "private" // optional, defaults to "public"
}
```

**Behavior:**

* Authenticated user creates a collection.
* Empty `books` array is allowed.

**Response Format:**

```json
{
  "success": true,
  "message": "Collection created successfully",
  "data": {
    "collection": { /* Newly created collection object */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Collection created successfully",
    "data": {
        "collection": {
            "user": {
                "_id": "683f1f1c250888a671a2cfe0",
                "username": "raiyan",
                "displayName": "Raiyan",
                "avatar": "https://lh3.googleusercontent.com/a/ACg8ocLbn7..."
            },
            "title": "Best Horror stories",
            "description": "So scary you'll pee your pants",
            "books": [],
            "tags": [],
            "visibility": "public",
            "_id": "683f1f3c250888a671a2cfe3",
            "createdAt": "2025-06-03T16:13:48.542Z",
            "updatedAt": "2025-06-03T16:13:48.542Z",
            "__v": 0
        }
    }
}
```

---

### Get a Collection by ID

**GET** `/api/collections/:id`

**Behavior:**

* Return the collection if:

  * It is **public**, OR
  * It belongs to the **authenticated user**

**Response Format:**

```json
{
  "success": true,
  "message": "Collection fetched successfully",
  "data": {
    "collection": { /* Collection details */ }
  }
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Collection fetched successfully",
    "data": {
        "collection": {
            "_id": "683f1f3c250888a671a2cfe3",
            "user": {
                "_id": "683f1f1c250888a671a2cfe0",
                "username": "raiyan",
                "displayName": "Raiyan",
                "avatar": "https://lh3.googleusercontent.com/a/ACg8ocLbn7..."
            },
            "title": "Best Horror stories",
            "description": "So scary you'll pee your pants",
            "books": [
                {
                    "volumeId": "7NRDAQAAMAAJ",
                    "_id": "683f3fb0cf197e63478c4ee7",
                    "addedAt": "2025-06-03T18:32:16.304Z"
                }
            ],
            "tags": [],
            "visibility": "public",
            "createdAt": "2025-06-03T16:13:48.542Z",
            "updatedAt": "2025-06-03T18:32:16.305Z",
            "__v": 3
        }
    }
}
```

---

### Update a Collection

**PATCH** `/api/collections/:id`

**Input:** `req.body.data`

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "visibility": "friends",
  "addBook": "google-book-id-3",
  "removeBook": "google-book-id-1"
}
```

**Behavior:**

* Only the **owner** can update.
* You can:

  * Change `title`, `description`, `visibility`
  * Add a book using `addBook` (collection limit: 100 books maximum)
  * Remove a book using `removeBook`

**Response Format:**

```json
{
  "success": true,
  "message": "Collection updated successfully",
  "data": {
    "collection": { /* Updated collection */ }
  }
}
```

<br>
<br>

Adding a book to collection for example, `req.body.data`:
```json
{
    "data": {
        "addBook": "7NRDAQAAMAAJ"
    }
}
```

Sample response:

```json
{
    "success": true,
    "message": "Collection updated successfully",
    "data": {
        "collection": {
            "_id": "683f1f3c250888a671a2cfe3",
            "user": {
                "_id": "683f1f1c250888a671a2cfe0",
                "username": "raiyan",
                "displayName": "Raiyan",
                "avatar": "https://lh3.googleusercontent.com/a/ACg8ocLbn7..."
            },
            "title": "Best Horror stories",
            "description": "So scary you'll pee your pants",
            "books": [
                {
                    "volumeId": "7NRDAQAAMAAJ",
                    "_id": "683f3dd2cf197e63478c4ece",
                    "addedAt": "2025-06-03T18:24:18.189Z"
                }
            ],
            "tags": [],
            "visibility": "public",
            "createdAt": "2025-06-03T16:13:48.542Z",
            "updatedAt": "2025-06-03T18:24:18.194Z",
            "__v": 1
        }
    }
}
```

**Error Response (Book limit exceeded):**

```json
{
  "success": false,
  "message": "Collection cannot have more than 100 books",
  "data": {}
}
```

---

### Delete a Collection

**DELETE** `/api/collections/:id`

**Behavior:**

* Only the **owner** can delete their collection.

**Response:**

```json
{
  "success": true,
  "message": "Collection deleted successfully",
  "data": {
    "collection": { /* All collection of current user after deletion*/ }
  }
}
```

---

## Reading List Routes

### Get Current User's Reading List

**GET** `/api/reading-list/me`

**Behavior:**

* Returns all reading list items of the **authenticated user**.

**Response Format:**

```json
{
  "success": true,
  "message": "Reading list fetched successfully",
  "data": {
    "readingList": [ /* Array of reading list items */ ]
  }
}
```

<br>
Sample response

```json
{
    "success": true,
    "message": "Reading list for current user fetched successfully",
    "data": {
        "readingList": [
            {
                "_id": "684ee3a724bd0e1c029018e9",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-1",
                "status": "interested",
                "visibility": "public",
                "createdAt": "2025-06-15T15:15:51.999Z",
                "updatedAt": "2025-06-15T15:15:51.999Z",
                "__v": 0
            },
            {
                "_id": "684ee3e524bd0e1c029018f0",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-2",
                "status": "reading",
                "startedAt": "2025-06-10T00:00:00.000Z",
                "visibility": "public",
                "createdAt": "2025-06-15T15:16:53.399Z",
                "updatedAt": "2025-06-15T15:16:53.399Z",
                "__v": 0
            }
        ]
    }
}
```

---

### Get Public Reading List of a User

**GET** `/api/reading-list/:userID`

**Behavior:**

* Returns only the **public** reading list items of the specified user.
* If no public items exist, returns an empty array.

**Response Format:**

```json
{
  "success": true,
  "message": "Reading list fetched successfully",
  "data": {
    "readingList": [ /* Array of public reading list items */ ]
  }
}
```

---

### Add Book to Reading List

**POST** `/api/reading-list`

**Input:** `req.body.data`

```json
{
  "volumeId": "google-book-id-1",
  "status": "interested",
  "startedAt": "2025-06-01T00:00:00.000Z", // optional depending on status
  "completedAt": "2025-06-05T00:00:00.000Z", // optional depending on status
  "visibility": "private", // optional, defaults to "public"
  "genres": ["fiction", "mystery"] // optional, array of book genres for recommendations
}
```

**Behavior:**

* Adds a new item to the current user's reading list.
* Ensures proper validation for `startedAt` and `completedAt` based on `status`.
* `genres` field is optional and used for generating reading recommendations.

**Date Validation Rules:**

| status     | startedAt | completedAt | Rule                                                                    |
| ---------- | --------- | ----------- | ----------------------------------------------------------------------- |
| interested | ❌         | ❌           | No dates needed                                                         |
| reading    | ✅         | ❌           | `startedAt` required, `completedAt` **must not be present**             |
| completed  | ✅         | ✅           | Both dates required. `completedAt` must not be earlier than `startedAt` |

**Response Format:**

```json
{
  "success": true,
  "message": "Book added to reading list successfully",
  "data": {
    "readingList": [ /* Full updated reading list of the user */ ]
  }
}
```

<br>

Sample request:
```json
{
    "data": {
        "volumeId": "book-id-2",
        "status": "reading",
        "startedAt": "2025-06-10T00:00:00.000Z",
        "genres": ["fiction", "mystery"]
    }
}
```


Sample Response:
```json
{
    "success": true,
    "message": "Book added to reading list successfully",
    "data": {
        "readingList": [
            {
                "_id": "684ee3a724bd0e1c029018e9",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-1",
                "status": "interested",
                "genres": ["sci-fi"],
                "visibility": "public",
                "createdAt": "2025-06-15T15:15:51.999Z",
                "updatedAt": "2025-06-15T15:15:51.999Z",
                "__v": 0
            },
            {
                "_id": "684ee3e524bd0e1c029018f0",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-2",
                "status": "reading",
                "startedAt": "2025-06-10T00:00:00.000Z",
                "genres": ["fiction", "mystery"],
                "visibility": "public",
                "createdAt": "2025-06-15T15:16:53.399Z",
                "updatedAt": "2025-06-15T15:16:53.399Z",
                "__v": 0
            }
        ]
    }
}
```


---

### Update Reading List Item

**PATCH** `/api/reading-list/:id`

**Input:** `req.body.data`

```json
{
  "status": "completed",
  "startedAt": "2025-06-01T00:00:00.000Z",
  "completedAt": "2025-06-05T00:00:00.000Z",
  "visibility": "friends"
}
```

**Behavior:**

* Only the **owner** can update their own reading list items.
* Updates the item by merging existing values with incoming ones.
* Enforces validation based on status:

**Date Validation Rules:**

| status     | startedAt | completedAt | Rule                                                                    |
| ---------- | --------- | ----------- | ----------------------------------------------------------------------- |
| interested | ❌         | ❌           | No dates needed                                                         |
| reading    | ✅         | ❌           | `startedAt` required, `completedAt` **must not be present**             |
| completed  | ✅         | ✅           | Both dates required. `completedAt` must not be earlier than `startedAt` |

**Response Format:**

```json
{
  "success": true,
  "message": "Reading list updated successfully",
  "data": {
    "readingList": [ /* Full updated reading list of the user */ ]
  }
}
```
<br>

Sample request:
PATCH `/api/reading-list/684ee3e524bd0e1c029018f0`
```json
{
    "data": {
        "status": "completed",
        "startedAt": "2025-06-10T00:00:00.000Z",
        "completedAt": "2025-06-15T00:00:00.000Z"
    }
}
```

Sample response:
```json
{
    "success": true,
    "message": "Reading list updated successfully",
    "data": {
        "readingList": [
            {
                "_id": "684ee3a724bd0e1c029018e9",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-1",
                "status": "interested",
                "visibility": "public",
                "createdAt": "2025-06-15T15:15:51.999Z",
                "updatedAt": "2025-06-15T15:15:51.999Z",
                "__v": 0
            },
            {
                "_id": "684ee3e524bd0e1c029018f0",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-2",
                "status": "completed",
                "startedAt": "2025-06-10T00:00:00.000Z",
                "visibility": "public",
                "createdAt": "2025-06-15T15:16:53.399Z",
                "updatedAt": "2025-06-15T15:50:56.680Z",
                "__v": 0,
                "completedAt": "2025-06-15T00:00:00.000Z"
            },
            {
                "_id": "684eeaa43154dfec142df8a5",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-3",
                "status": "completed",
                "startedAt": "2025-06-10T00:00:00.000Z",
                "completedAt": "2025-06-15T00:00:00.000Z",
                "visibility": "public",
                "createdAt": "2025-06-15T15:45:40.891Z",
                "updatedAt": "2025-06-15T15:45:40.891Z",
                "__v": 0
            }
        ]
    }
}
```


---

### Delete from Reading List

**DELETE** `/api/reading-list/:id`

**Behavior:**

* Only the **owner** can delete a reading list item.

**Response Format:**

```json
{
  "success": true,
  "message": "Reading list item deleted successfully",
  "data": {
    "readingList": [ /* Full updated reading list of the user */ ]
  }
```

<br>

Sample Response:
```json
{
    "success": true,
    "message": "Reading list item deleted successfully",
    "data": {
        "readingList": [
            {
                "_id": "684ee3a724bd0e1c029018e9",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-1",
                "status": "interested",
                "visibility": "public",
                "createdAt": "2025-06-15T15:15:51.999Z",
                "updatedAt": "2025-06-15T15:15:51.999Z",
                "__v": 0
            },
            {
                "_id": "684ee3e524bd0e1c029018f0",
                "user": "6843292c5cc2e9ee0b9bc0a9",
                "volumeId": "book-id-2",
                "status": "reading",
                "startedAt": "2025-06-10T00:00:00.000Z",
                "visibility": "public",
                "createdAt": "2025-06-15T15:16:53.399Z",
                "updatedAt": "2025-06-15T15:16:53.399Z",
                "__v": 0
            }
        ]
    }
}
```

---

### Get Reading Recommendations

**GET** `/api/reading-list/recommendations`

**Behavior:**

* Returns the top 5 most frequently read genres by the authenticated user based on their reading list.
* Counts are calculated dynamically from the user's current reading list.
* Genres are ranked by frequency (how many books of each genre the user has added).

**Headers:**

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Response Format:**

```json
{
  "success": true,
  "message": "Recommendations fetched successfully",
  "data": {
    "topGenres": [ /* Array of top 5 genres with counts */ ],
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Recommendations fetched successfully",
    "data": {
        "topGenres": [
            { "genre": "fiction", "count": 12 },
            { "genre": "mystery", "count": 8 },
            { "genre": "science fiction", "count": 5 },
            { "genre": "fantasy", "count": 3 },
            { "genre": "biography", "count": 2 }
        ],
    }
}
```

**Note:** If user has no books in reading list, `topGenres` will be an empty array.

---

## Blog Routes

### List Blogs

**GET** `/api/blogs`

**Query Parameters (optional):**

* `author=me` — Fetch blogs written by the authenticated user.
* `author=<uid>` — Fetch **public** blogs of a specific user.
* `search=<query>` — Search blogs by title (case insensitive).

**Behavior:**

* No `author` param → Return all **public** blogs (sorted by most recent, paginated 20 per page).
* `author=me` → Return **all** blogs of the authenticated user (private + friends + public).
* `author=<uid>` → Return only **public** blogs by that user.
* `search=<query>` → Search blogs by title (case insensitive). Returns paginated results, 20 per page if multiple matches found. Can be combined with `author` parameter.

**Response Format:**

```json
{
  "success": true,
  "message": "Blogs fetched successfully",
  "data": {
    "blogs": [ /* Array of blog objects */ ]
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Blogs fetched successfully",
    "data": {
        "blogs": [
            {
                "_id": "6847133861841477d982ac22",
                "user": {
                    "_id": "6843292c5cc2e9ee0b9bc0a9",
                    "username": "test",
                    "displayName": "TestUser",
                    "avatar": "Dummy avatar"
                },
                "title": "My Second Blog!",
                "content": "## This is blog content",
                "visibility": "public",
                "spoilerAlert": false,
                "genres": [],
                "createdAt": "2025-06-09T17:00:40.091Z",
                "updatedAt": "2025-06-09T17:00:40.091Z",
                "__v": 0
            },
            {
                "_id": "68470ca92df9925ccd743b78",
                "user": {
                    "_id": "6843292c5cc2e9ee0b9bc0a9",
                    "username": "test",
                    "displayName": "TestUser",
                    "avatar": "Dummy avatar"
                },
                "title": "My First Blog!",
                "content": "## This is my first blog",
                "visibility": "public",
                "spoilerAlert": false,
                "genres": [],
                "createdAt": "2025-06-09T16:32:41.983Z",
                "updatedAt": "2025-06-09T16:32:41.983Z",
                "__v": 0
            }
        ]
    }
}
```

---

### Get a Blog by ID

**GET** `/api/blogs/:id`

**Behavior:**

* Return the blog if:

  * It is **public**, OR
  * It belongs to the **authenticated user**

**Response Format:**

```json
{
  "success": true,
  "message": "Blog fetched successfully",
  "data": {
    "blog": { /* Blog details */ }
  }
}
```

<br>

Sample response (success):

```json
{
    "success": true,
    "message": "Blog fetched successfully",
    "data": {
        "blog": {
            "_id": "6847144261841477d982ac2f",
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "test",
                "displayName": "TestUser",
                "avatar": "Dummy avatar"
            },
            "title": "My First Blog!",
            "content": "## This is my first blog",
            "visibility": "public",
            "spoilerAlert": false,
            "genres": [],
            "createdAt": "2025-06-09T17:05:06.094Z",
            "updatedAt": "2025-06-09T17:05:06.094Z",
            "__v": 0
        }
    }
}
```

<br>

Sample response (no permission):
```json
{
    "success": true,
    "message": "You do not have access to this blog"
}
```
---


### Create a Blog

**POST** `/api/blogs`

**Input:** `req.body.data`

```json
{
  "title": "Reflections on Reading", // required
  "content": "Books change lives...", // required
  "visibility": "public", // defaults to "public"
  "spoilerAlert": false, // required
  "genres": ["Drama", "Biography"] // optional
}
```

**Behavior:**

* Authenticated user creates a blog post.
* `visibility` can be `public`, `friends`, or `private`.
* blog `content` must be Markdown string
* `genres` must be chosen from predefined GENRES.

**Response Format:**

```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "blog": { /* Newly created blog object */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Blog created successfully",
    "data": {
        "blog": {
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "test",
                "displayName": "TestUser",
                "avatar": "Dummy avatar"
            },
            "title": "My First Blog!",
            "content": "## This is my first blog",
            "visibility": "public",
            "spoilerAlert": false,
            "genres": [],
            "_id": "6847144261841477d982ac2f",
            "createdAt": "2025-06-09T17:05:06.094Z",
            "updatedAt": "2025-06-09T17:05:06.094Z",
            "__v": 0
        }
    }
}
```

---


### Update a Blog

**PATCH** `/api/blogs/:id`

**Input:** `req.body.data`
Any one or multiple of the following fields can be updated:

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "visibility": "friends",
  "spoilerAlert": true,
  "genres": ["Mystery"]
}
```

**Behavior:**

* Only the **owner** can update their blog.
* Fields like `title`, `content`, `visibility`, `genres`, and `spoilerAlert` can be updated.

**Response Format:**

```json
{
  "success": true,
  "message": "Blog updated successfully",
  "data": {
    "blog": { /* Updated blog */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Blog updated successfully",
    "data": {
        "blog": {
            "_id": "6847133861841477d982ac22",
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "test",
                "displayName": "TestUser",
                "avatar": "Dummy avatar"
            },
            "title": "My Second Blog!",
            "content": "## This is blog content\n\nThis line is newly added!**",
            "visibility": "public",
            "spoilerAlert": false,
            "genres": [],
            "createdAt": "2025-06-09T17:00:40.091Z",
            "updatedAt": "2025-06-09T17:21:56.138Z",
            "__v": 0
        }
    }
}
```

---

### Delete a Blog

**DELETE** `/api/blogs/:id`

**Behavior:**

* Only the **owner** can delete their blog.

**Response:**

```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Blog deleted successfully",
    "data": {}
}
```

---

## Discussion Routes

### List Discussions

**GET** `/api/discussions`

**Query Parameters (optional):**

* `author=me` — Fetch discussions created by the current authenticated user.
* `author=<uid>` — Fetch **public** discussions of a specific user.
* `search=<query>` — Search discussions by title (case insensitive).

**Behavior:**

* No `author` param → Return all **public** discussions (sorted by most recent, paginated 20 per page).
* `author=me` → Return **all** discussions of the authenticated user (public only for now).
* `author=<uid>` → Return only **public** discussions by that user.
* `search=<query>` → Search discussions by title (case insensitive). Returns paginated results, 20 per page if multiple matches found. Can be combined with `author` parameter.
* Returns **preview data only** (excludes discussion content to reduce response size).

**Response Format:**

```json
{
  "success": true,
  "message": "Discussions fetched successfully",
  "data": {
    "discussions": [ /* Array of discussion objects */ ]
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Discussions fetched successfully",
    "data": {
        "discussions": [
            {
                "_id": "6847133861841477d982ac22",
                "user": {
                    "_id": "6843292c5cc2e9ee0b9bc0a9",
                    "username": "bookworm",
                    "displayName": "BookWorm",
                    "avatar": "https://lh3.googleusercontent.com/..."
                },
                "title": "What makes a book truly unforgettable?",
                "visibility": "public",
                "spoilerAlert": false,
                "genres": ["fiction", "literary-fiction"],
                "createdAt": "2025-06-09T17:00:40.091Z",
                "updatedAt": "2025-06-09T17:00:40.091Z",
                "__v": 0
            },
            {
                "_id": "68470ca92df9925ccd743b78",
                "user": {
                    "_id": "6843292c5cc2e9ee0b9bc0a9",
                    "username": "scifireader",
                    "displayName": "SciFi Reader",
                    "avatar": "https://lh3.googleusercontent.com/..."
                },
                "title": "Best sci-fi books of 2024?",
                "visibility": "public",
                "spoilerAlert": false,
                "genres": ["sci-fi"],
                "createdAt": "2025-06-09T16:32:41.983Z",
                "updatedAt": "2025-06-09T16:32:41.983Z",
                "__v": 0
            }
        ]
    }
}
```

---

### Get a Discussion by ID

**GET** `/api/discussions/:id`

**Behavior:**

* Return the discussion along with its content and other details if it is **public**.
* For now, only public discussions are accessible.

**Response Format:**

```json
{
  "success": true,
  "message": "Discussion fetched successfully",
  "data": {
    "discussion": { /* Discussion details */ }
  }
}
```

<br>

Sample response (success):

```json
{
    "success": true,
    "message": "Discussion fetched successfully",
    "data": {
        "discussion": {
            "_id": "6847144261841477d982ac2f",
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "bookworm",
                "displayName": "BookWorm",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "title": "What makes a book truly unforgettable?",
            "content": "I've been thinking about what separates books that stay with us forever from those we quickly forget. Is it the characters? The plot twists? The emotional connection? I'd love to hear your thoughts on books that have left a lasting impact on you.",
            "visibility": "public",
            "spoilerAlert": false,
            "genres": ["fiction", "literary-fiction"],
            "createdAt": "2025-06-09T17:05:06.094Z",
            "updatedAt": "2025-06-09T17:05:06.094Z",
            "__v": 0
        }
    }
}
```

<br>

Sample response (no access):
```json
{
    "success": false,
    "message": "Discussion not found or not accessible"
}
```

---

### Create a Discussion

**POST** `/api/discussions`

**Input:** `req.body.data`

```json
{
  "title": "Your thoughts on modern fantasy?", // required, max 100 characters
  "content": "I've been reading a lot of modern fantasy lately...", // required, max 2000 characters
  "visibility": "public", // defaults to "public"
  "spoilerAlert": false, // required
  "genres": ["fantasy", "fiction"] // optional
}
```

**Behavior:**

* Authenticated user creates a discussion.
* `visibility` is currently set to `public` only.
* Discussion `content` is markdown string with a maximum of 2000 characters.
* `title` has a maximum of 100 characters.
* `genres` must be chosen from predefined GENRES.

**Response Format:**

```json
{
  "success": true,
  "message": "Discussion created successfully",
  "data": {
    "discussion": { /* Newly created discussion object */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Discussion created successfully",
    "data": {
        "discussion": {
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "bookworm",
                "displayName": "BookWorm",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "title": "Your thoughts on modern fantasy?",
            "content": "I've been reading a lot of modern fantasy lately and I'm curious about what others think. Are we in a golden age of fantasy literature?",
            "visibility": "public",
            "spoilerAlert": false,
            "genres": ["fantasy", "fiction"],
            "_id": "6847144261841477d982ac2f",
            "createdAt": "2025-06-09T17:05:06.094Z",
            "updatedAt": "2025-06-09T17:05:06.094Z",
            "__v": 0
        }
    }
}
```

---

### Update a Discussion

**PATCH** `/api/discussions/:id`

**Input:** `req.body.data`
Any one or multiple of the following fields can be updated:

```json
{
  "title": "Updated Discussion Title",
  "content": "Updated discussion content...",
  "spoilerAlert": true,
  "genres": ["mystery", "thriller"]
}
```

**Behavior:**

* Only the **owner** can update their discussion.
* Fields like `title`, `content`, `spoilerAlert`, and `genres` can be updated.
* `visibility` is currently not updateable (always public).
* `title` has a maximum of 100 characters.
* `content` has a maximum of 2000 characters.

**Response Format:**

```json
{
  "success": true,
  "message": "Discussion updated successfully",
  "data": {
    "discussion": { /* Updated discussion */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Discussion updated successfully",
    "data": {
        "discussion": {
            "_id": "6847133861841477d982ac22",
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "bookworm",
                "displayName": "BookWorm",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "title": "Updated: What makes a book truly unforgettable?",
            "content": "I've been thinking about what separates books that stay with us forever from those we quickly forget. Updated with more thoughts after our recent book club discussion!",
            "visibility": "public",
            "spoilerAlert": true,
            "genres": ["fiction", "literary-fiction"],
            "createdAt": "2025-06-09T17:00:40.091Z",
            "updatedAt": "2025-06-09T17:21:56.138Z",
            "__v": 0
        }
    }
}
```

---

### Delete a Discussion

**DELETE** `/api/discussions/:id`

**Behavior:**

* Only the **owner** can delete their discussion.

**Response:**

```json
{
  "success": true,
  "message": "Discussion deleted successfully"
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Discussion deleted successfully",
    "data": {}
}
```

---

## Discussion Comment Routes

### List Comments for a Discussion

**GET** `/api/comments/:discussionId`

**Behavior:**

* Returns all comments for a specific discussion in a hierarchical structure.
* Parent comments are returned with their replies nested.
* Only public comments are returned.
* Results are sorted by creation time (oldest first for better reading flow).

**Response Format:**

```json
{
  "success": true,
  "message": "Comments fetched successfully",
  "data": {
    "comments": [ /* Array of parent comments with nested replies */ ]
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Comments fetched successfully",
    "data": {
        "comments": [
            {
                "_id": "6847133861841477d982ac22",
                "discussion": "6847144261841477d982ac2f",
                "user": {
                    "_id": "6843292c5cc2e9ee0b9bc0a9",
                    "username": "bookworm",
                    "displayName": "BookWorm",
                    "avatar": "https://lh3.googleusercontent.com/..."
                },
                "content": "This is such an interesting discussion! I completely agree with your perspective.",
                "spoilerAlert": false,
                "parentComment": null,
                "createdAt": "2025-06-09T17:00:40.091Z",
                "updatedAt": "2025-06-09T17:00:40.091Z",
                "replies": [
                    {
                        "_id": "6847144261841477d982ac30",
                        "discussion": "6847144261841477d982ac2f",
                        "user": {
                            "_id": "6843292c5cc2e9ee0b9bc0a9",
                            "username": "scifireader",
                            "displayName": "SciFi Reader",
                            "avatar": "https://lh3.googleusercontent.com/..."
                        },
                        "content": "Thanks for sharing your thoughts! What other books would you recommend?",
                        "spoilerAlert": false,
                        "parentComment": "6847133861841477d982ac22",
                        "createdAt": "2025-06-09T17:10:40.091Z",
                        "updatedAt": "2025-06-09T17:10:40.091Z"
                    }
                ]
            }
        ]
    }
}
```

---

### Create a Comment

**POST** `/api/comments`

**Input:** `req.body.data`

```json
{
  "discussionId": "6847144261841477d982ac2f", // required
  "content": "This is my comment on the discussion...", // required, max 500 characters
  "spoilerAlert": false, // required
  "parentComment": "6847133861841477d982ac22" // optional, for replies
}
```

**Behavior:**

* Authenticated user creates a comment on a discussion.
* If `parentComment` is provided, creates a reply to that comment.
* If `parentComment` is null/not provided, creates a top-level comment.
* Replies can only be made to parent comments (1-level deep only).
* Content has a maximum of 500 characters.

**Response Format:**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "comment": { /* Newly created comment object */ }
  }
}
```

<br>

Sample request (parent comment):
```json
{
    "data": {
        "discussionId": "6847144261841477d982ac2f",
        "content": "This is a fascinating topic! I'd love to hear more perspectives.",
        "spoilerAlert": false
    }
}
```

Sample request (reply comment):
```json
{
    "data": {
        "discussionId": "6847144261841477d982ac2f",
        "content": "I completely agree with your point about character development.",
        "spoilerAlert": false,
        "parentComment": "6847133861841477d982ac22"
    }
}
```

Sample response:

```json
{
    "success": true,
    "message": "Comment created successfully",
    "data": {
        "comment": {
            "_id": "6847144261841477d982ac35",
            "discussion": "6847144261841477d982ac2f",
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "bookworm",
                "displayName": "BookWorm",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "content": "This is a fascinating topic! I'd love to hear more perspectives.",
            "spoilerAlert": false,
            "parentComment": null,
            "createdAt": "2025-06-09T17:15:40.091Z",
            "updatedAt": "2025-06-09T17:15:40.091Z",
            "__v": 0
        }
    }
}
```

**Error Response (trying to reply to a reply):**

```json
{
  "success": false,
  "message": "Comments can only be 1 level deep (replies to replies are not allowed)",
  "data": {}
}
```

---

### Update a Comment

**PATCH** `/api/comments/:id`

**Input:** `req.body.data`

```json
{
  "content": "Updated comment content...", // optional
  "spoilerAlert": true // optional
}
```

**Behavior:**

* Only the **owner** can update their comment.
* Only `content` and `spoilerAlert` fields can be updated.
* `content` has a maximum of 500 characters.
* Cannot change `discussionId` or `parentComment` after creation.

**Response Format:**

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "comment": { /* Updated comment object */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Comment updated successfully",
    "data": {
        "comment": {
            "_id": "6847144261841477d982ac35",
            "discussion": "6847144261841477d982ac2f",
            "user": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "bookworm",
                "displayName": "BookWorm",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "content": "Updated: This is an even more fascinating topic after reading everyone's thoughts!",
            "spoilerAlert": true,
            "parentComment": null,
            "createdAt": "2025-06-09T17:15:40.091Z",
            "updatedAt": "2025-06-09T17:25:40.091Z",
            "__v": 0
        }
    }
}
```

---

### Delete a Comment

**DELETE** `/api/comments/:id`

**Behavior:**

* Only the **owner** can delete their comment.
* Deleting a parent comment will also delete all its replies.
* This is a permanent action and cannot be undone.

**Response:**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Comment deleted successfully",
    "data": {}
}
```

**Response when comment has replies:**

```json
{
    "success": true,
    "message": "Comment and its replies deleted successfully",
    "data": {
        "deletedCount": 3
    }
}
```

---

## User Books Routes

### List User Books

**GET** `/api/user-books`

**Query Parameters (optional):**

* `author=me` — Fetch books written by the authenticated user.
* `author=<uid>` — Fetch **public** books of a specific user.
* `search=<query>` — Search books by title (case insensitive).
* `genre=<genre>` — Filter books by genre.
* `completed=<true/false>` — Filter by completion status.

**Behavior:**

* No `author` param → Return all **public** books (sorted by most recent, paginated 20 per page).
* `author=me` → Return **all** books of the authenticated user (private + public).
* `author=<uid>` → Return only **public** books by that user.
* `search=<query>` → Search books by title (case insensitive). Can be combined with other parameters.
* Returns book metadata only (chapters not included).

**Response Format:**

```json
{
  "success": true,
  "message": "User books fetched successfully",
  "data": {
    "books": [ /* Array of book objects */ ]
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "User books fetched successfully",
    "data": {
        "books": [
            {
                "_id": "6847133861841477d982ac22",
                "author": {
                    "_id": "6843292c5cc2e9ee0b9bc0a9",
                    "username": "fantasywrites",
                    "displayName": "Fantasy Writer",
                    "avatar": "https://lh3.googleusercontent.com/..."
                },
                "title": "The Chronicles of Aetheria",
                "synopsis": "An epic fantasy tale of magic, friendship, and the fight against darkness...",
                "genres": ["fantasy", "adventure"],
                "visibility": "public",
                "coverImage": "https://firebase.storage.url/cover123.jpg",
                "likes": ["user1", "user2"],
                "isCompleted": false,
                "createdAt": "2025-06-09T17:00:40.091Z",
                "updatedAt": "2025-06-09T17:00:40.091Z",
                "chapterCount": 5,
                "totalWordCount": 12450
            }
        ]
    }
}
```

---

### Get a User Book by ID

**GET** `/api/user-books/:id`

**Behavior:**

* Return the book if:
  * It is **public**, OR
  * It belongs to the **authenticated user**
* Includes basic book information and chapter list (titles only).
* Chapter content not included - use chapter endpoints for full content.

**Response Format:**

```json
{
  "success": true,
  "message": "User book fetched successfully",
  "data": {
    "book": { /* Book details with chapter list */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "User book fetched successfully",
    "data": {
        "book": {
            "_id": "6847133861841477d982ac22",
            "author": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "fantasywrites",
                "displayName": "Fantasy Writer",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "title": "The Chronicles of Aetheria",
            "synopsis": "An epic fantasy tale of magic, friendship, and the fight against darkness in the mystical realm of Aetheria.",
            "genres": ["fantasy", "adventure"],
            "visibility": "public",
            "coverImage": "https://firebase.storage.url/cover123.jpg",
            "likes": ["user1", "user2"],
            "isCompleted": false,
            "createdAt": "2025-06-09T17:00:40.091Z",
            "updatedAt": "2025-06-15T12:30:40.091Z",
            "chapters": [
                {
                    "_id": "ch1",
                    "title": "The Awakening",
                    "chapterNumber": 1,
                    "visibility": "public",
                    "wordCount": 2500,
                    "createdAt": "2025-06-09T18:00:40.091Z"
                },
                {
                    "_id": "ch2",
                    "title": "The Journey Begins",
                    "chapterNumber": 2,
                    "visibility": "private",
                    "wordCount": 0,
                    "createdAt": "2025-06-10T10:00:40.091Z"
                }
            ]
        }
    }
}
```

---

### Create a User Book

**POST** `/api/user-books`

**Input:** `req.body.data`

```json
{
  "title": "My New Book", // required, max 500 characters
  "synopsis": "A captivating story about...", // optional, max 1000 characters
  "genres": ["fiction", "drama"], // optional
  "visibility": "private", // optional, defaults to "private"
  "coverImage": "https://firebase.storage.url/cover.jpg" // optional, Firebase storage URL
}
```

**Behavior:**

* Authenticated user creates a new book.
* Book starts with no chapters (can be added later).
* `visibility` defaults to "private".
* `coverImage` should be a Firebase Storage URL.

**Response Format:**

```json
{
  "success": true,
  "message": "User book created successfully",
  "data": {
    "book": { /* Newly created book object */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "User book created successfully",
    "data": {
        "book": {
            "_id": "6847144261841477d982ac35",
            "author": {
                "_id": "6843292c5cc2e9ee0b9bc0a9",
                "username": "newauthor",
                "displayName": "New Author",
                "avatar": "https://lh3.googleusercontent.com/..."
            },
            "title": "My New Book",
            "synopsis": "A captivating story about friendship and adventure.",
            "genres": ["fiction", "drama"],
            "visibility": "private",
            "coverImage": "https://firebase.storage.url/cover.jpg",
            "likes": [],
            "isCompleted": false,
            "createdAt": "2025-06-09T17:15:40.091Z",
            "updatedAt": "2025-06-09T17:15:40.091Z",
            "__v": 0
        }
    }
}
```

---

### Update a User Book

**PATCH** `/api/user-books/:id`

**Input:** `req.body.data`

```json
{
  "title": "Updated Book Title", // optional
  "synopsis": "Updated synopsis...", // optional
  "genres": ["fantasy", "adventure"], // optional
  "visibility": "public", // optional
  "coverImage": "https://firebase.storage.url/newcover.jpg", // optional
  "isCompleted": true // optional
}
```

**Behavior:**

* Only the **author** can update their book.
* All fields are optional - update only provided fields.
* Changing visibility to "private" when book has public chapters will fail.
* Setting `isCompleted` to `true` requires the book to have at least one chapter.
* `coverImage` should be Firebase Storage URL.

**Response Format:**

```json
{
  "success": true,
  "message": "User book updated successfully",
  "data": {
    "book": { /* Updated book object */ }
  }
}
```

**Error Response (visibility conflict):**

```json
{
  "success": false,
  "message": "Cannot make book private while it has public chapters",
  "data": {}
}
```

**Error Response (completion without chapters):**

```json
{
  "success": false,
  "message": "Cannot mark book as completed without any chapters",
  "data": {}
}
```

---

### Delete a User Book

**DELETE** `/api/user-books/:id`

**Behavior:**

* Only the **author** can delete their book.
* Deleting a book will also delete all its chapters.
* This is a permanent action and cannot be undone.

**Response:**

```json
{
  "success": true,
  "message": "User book and all chapters deleted successfully"
}
```

---

### Like/Unlike a User Book

**POST** `/api/user-books/:id/like`

**Behavior:**

* Authenticated user can like/unlike a public book.
* Toggles like status - if already liked, removes like; if not liked, adds like.
* Authors cannot like their own books.

**Response Format:**

```json
{
  "success": true,
  "message": "Book liked successfully", // or "Book unliked successfully"
  "data": {
    "liked": true, // or false if unliked
    "likeCount": 15
  }
}
```

---

## Chapter Routes

### Get Chapters for a Book

**GET** `/api/user-books/:bookId/chapters`

**Query Parameters (optional):**

* `published=<true/false>` — Filter by published status (public chapters only).

**Behavior:**

* Returns chapter metadata for the specified book (content excluded for performance).
* If user is the author: returns all chapters (private + public).
* If user is not the author: returns only public chapters.
* Chapters are sorted by chapter number.
* Use the individual chapter endpoint to get full content.

**Response Format:**

```json
{
  "success": true,
  "message": "Chapters fetched successfully",
  "data": {
    "chapters": [ /* Array of chapter objects without content */ ]
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Chapters fetched successfully",
    "data": {
        "chapters": [
            {
                "_id": "ch1",
                "book": "book123",
                "author": {
                    "_id": "user123",
                    "username": "fantasywrites",
                    "displayName": "Fantasy Writer"
                },
                "title": "The Awakening",
                "chapterNumber": 1,
                "visibility": "public",
                "wordCount": 2500,
                "likes": ["user1", "user2"],
                "createdAt": "2025-06-09T18:00:40.091Z",
                "updatedAt": "2025-06-09T18:00:40.091Z"
            },
            {
                "_id": "ch2",
                "book": "book123", 
                "author": {
                    "_id": "user123",
                    "username": "fantasywrites",
                    "displayName": "Fantasy Writer"
                },
                "title": "The Journey Begins",
                "chapterNumber": 2,
                "visibility": "private",
                "wordCount": 0,
                "likes": [],
                "createdAt": "2025-06-10T10:00:40.091Z",
                "updatedAt": "2025-06-10T10:00:40.091Z"
            }
        ]
    }
}
```

---

### Get a Specific Chapter

**GET** `/api/chapters/:id`

**Behavior:**

* Return the chapter if:
  * It is **public**, OR
  * It belongs to the **authenticated user**
* Includes full chapter content.

**Response Format:**

```json
{
  "success": true,
  "message": "Chapter fetched successfully",
  "data": {
    "chapter": { /* Full chapter object with content */ }
  }
}
```

<br>

Sample response:

```json
{
    "success": true,
    "message": "Chapter fetched successfully",
    "data": {
        "chapter": {
            "_id": "ch1",
            "book": {
                "_id": "book123",
                "title": "The Chronicles of Aetheria",
                "author": {
                    "username": "fantasywrites",
                    "displayName": "Fantasy Writer"
                }
            },
            "author": {
                "_id": "user123",
                "username": "fantasywrites",
                "displayName": "Fantasy Writer"
            },
            "title": "The Awakening",
            "content": "The morning sun cast long shadows across the ancient forest as Lyra stepped into the clearing...",
            "chapterNumber": 1,
            "visibility": "public",
            "wordCount": 2500,
            "likes": ["user1", "user2"],
            "createdAt": "2025-06-09T18:00:40.091Z",
            "updatedAt": "2025-06-09T18:00:40.091Z"
        }
    }
}
```

---

### Create a Chapter

**POST** `/api/chapters`

**Input:** `req.body.data`

```json
{
  "bookId": "6847144261841477d982ac35", // required
  "title": "Chapter Title", // required, max 200 characters
  "content": "Chapter content goes here...", // required, max 50,000 characters
  "chapterNumber": 1, // required, must be unique per book
  "visibility": "private" // optional, defaults to "private"
}
```

**Behavior:**

* Only the book author can create chapters for their book.
* `chapterNumber` must be unique within the book.
* If book is private, chapter cannot be public.
* Word count is automatically calculated.

**Response Format:**

```json
{
  "success": true,
  "message": "Chapter created successfully",
  "data": {
    "chapter": { /* Newly created chapter object */ }
  }
}
```

**Error Response (visibility conflict):**

```json
{
  "success": false,
  "message": "Chapter cannot be public when the book is private",
  "data": {}
}
```

**Error Response (duplicate chapter number):**

```json
{
  "success": false,
  "message": "Chapter number already exists for this book",
  "data": {}
}
```

---

### Update a Chapter

**PATCH** `/api/chapters/:id`

**Input:** `req.body.data`

```json
{
  "title": "Updated Chapter Title", // optional
  "content": "Updated chapter content...", // optional
  "visibility": "public" // optional
}
```

**Behavior:**

* Only the chapter author can update their chapter.
* Cannot change `bookId` or `chapterNumber` after creation.
* If changing visibility to public, parent book must be public.
* Word count is automatically recalculated if content changes.

**Response Format:**

```json
{
  "success": true,
  "message": "Chapter updated successfully",
  "data": {
    "chapter": { /* Updated chapter object */ }
  }
}
```

---

### Delete a Chapter

**DELETE** `/api/chapters/:id`

**Behavior:**

* Only the chapter author can delete their chapter.
* This is a permanent action and cannot be undone.

**Response:**

```json
{
  "success": true,
  "message": "Chapter deleted successfully"
}
```

---

### Like/Unlike a Chapter

**POST** `/api/chapters/:id/like`

**Behavior:**

* Authenticated user can like/unlike a public chapter.
* Toggles like status - if already liked, removes like; if not liked, adds like.
* Authors cannot like their own chapters.

**Response Format:**

```json
{
  "success": true,
  "message": "Chapter liked successfully", // or "Chapter unliked successfully"
  "data": {
    "liked": true, // or false if unliked
    "likeCount": 8
  }
}
```

---

