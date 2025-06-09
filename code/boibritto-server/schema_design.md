# BoiBritto DB Schema

**Entities**

* `User`
* `Admin`
* `Collection`
* `ReadingList`
* `Blog`
* `Discussion`
* `Connection`
* `User Books`

---

**Keep GENRES to a central shared module (like- in utils/constants.js, `constants.GENRE`) so all schemas can require it**

```js
const GENRES = [
  "fiction",
  "non-fiction",
  "fantasy",
  "sci-fi",
  "mystery",
  "romance",
  "thriller",
  "historical",
  "biography",
  "poetry",
  "self-help",
  "horror",
  "drama",
  "adventure",
  "comedy",
  "spirituality",
  "philosophy",
  "science",
  "psychology",
  "young-adult",
  "children",
  "classic",
  "graphic-novel",
  "memoir",
  "education",
  "others"
];
```
---

### 🧑‍💻 1. `User` Schema

```js

const mongoose = require("mongoose");
const { GENRES } = require("../utils/constants");

const userSchema = new mongoose.Schema({
        uid: { type: String, required: true, unique: true }, // Firebase UID
        email: { type: String, required: true, unique: true },

        // unique alias for the platform
        // (ask for unique unsername in signup page)
        username: { type: String, required: true, unique: true },
        displayName: { type: String, required: true }, // from firebase "name"
        bio: { type: String, maxlength: 500 },
        avatar: { type: String }, // from Firebase Google avatar
        interestedGenres: {
            type: [String],
            enum: GENRES,
            default: []
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);


```

---

### 👮‍♂️ 2. `Admin` Schema

Will work on it later for admin panel, but just keep the schema ready

```js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
        {
          uid: { type: String, required: true, unique: true }, // Firebase UID (manual registration)
          email: { type: String, required: true, unique: true },
          name: { type: String, required: true }, // Admin's full name
          avatar: { type: String }, // optional

          role: {
            type: String,
            enum: ["superadmin", "moderator"],
            default: "moderator"
          },

          permissions: {
            type: [String],
            default: [] // e.g., ["manageUsers", "reviewReports"]
          }
        },
        { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

```

---

### 📚 3. `Collection` Schema

```js
const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, maxlength: 200 },
    books: [
      {
        volumeId: { type: String, required: true }, // Google Books ID
        addedAt: { type: Date, default: Date.now },
      }
    ],
    tags: [String],
    visibility: { type: String, enum: ["private", "friends", "public"], default: "public" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);
```

---

### 📖 4. ReadingList

```js
const mongoose = require("mongoose");

const readingListSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    volumeId: { type: String, required: true }, // Google Books ID
    status: {
      type: String,
      enum: ["interested", "reading", "completed"],
      required: true,
    },
    startedAt: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.status === "reading" || this.status === "completed") {
            return value instanceof Date;
          }
          return true;
        },
        message: "Started date is required when status is 'reading' or 'completed'.",
      },
    },
    completedAt: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.status === "completed") {
            return value instanceof Date;
          }
          return true;
        },
        message: "Completed date is required when status is 'completed'.",
      },
    },
    visibility: { type: String, enum: ["private", "friends", "public"], default: "public" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingList", readingListSchema);
```

💡 Explanation

* If status is "interested" — no dates are required.
* If status is "reading" — startedAt must be present.
* If status is "completed" — both startedAt and completedAt must be present.

---

### 📝 5. `Blog` Schema

```js
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    visibility: { type: String, enum: ["private", "friends", "public"], default: "public" },
    spoilerAlert: { type: Boolean, required: true },
    genres: {
      type: [String],
      enum: GENRES,
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
```

---

### 💬 6. `Discussion` Schema

```js
const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    topic: { type: String },
    visibility: { type: String, enum: ["friends", "public"], default: "public" },
    spoilerAlert: { type: Boolean, required: true },
    genres: {
      type: [String],
      enum: GENRES,
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);
```

---

### 💬 `Comment` Schema (for discussions thread)

```js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
```

---

### 🧑‍🤝‍🧑 `Connection` Schema
Will work on it later


#### ✅ Design Overview

* One user sends a request to another.
* The recipient can **accept** or **decline**.
* If accepted, both are “connected”.
* You don’t need mutual references on both `User` documents — just query `Connection` collection for relationships.

---

```js
const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate connection requests
connectionSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);
```

---

### 💡 Usage Logic

* A user (say `User A`) sends request → create a `Connection` with:

  ```json
  {
    from: A,
    to: B,
    status: "pending"
  }
  ```
* User B accepts → update status to "accepted".
* User B declines → update status to "declined" or delete it.
* To check connections: query for any document where:

  ```js
  { $or: [
      { from: userId, status: "accepted" },
      { to: userId, status: "accepted" }
    ]
  }
  ```

---

### 📖 User book
( work for later, but keep the schema )
```js
const userBookSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    synopsis: { type: String, maxlength: 1000 },
    genres: {
      type: [String],
      enum: GENRES,
      default: []
    },
    visibility: { type: String, enum: ["private", "friends", "public"], default: "private" },
    chapters: [
      {
        title: String,
        content: String, // store Markdown
        createdAt: { type: Date, default: Date.now }
      }
    ],
    coverImage: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);
```
---

Here's a schema for reporting content, designed to be flexible and compatible with all types of user-generated content in BoiBritto (blogs, discussions, comments, user books, etc.):

---

### 🚨 `Report` Schema

```js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // What is being reported
    contentType: {
      type: String,
      enum: ["profile", "blog", "discussion", "comment", "userBook", "collection"],
      required: true
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    reason: {
      type: String,
      enum: [
        "inappropriate",
        "spam",
        "harassment",
        "plagiarism",
        "false information",
        "copyright violation",
        "other"
      ],
      required: true
    },

    description: {
      type: String,
      maxlength: 500
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed", "action-taken"],
      default: "pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  { timestamps: true }
);

reportSchema.index({ contentType: 1, contentId: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
```

---

**How It Works**

* A report is tied to a `contentType` and its corresponding `contentId`.
* A user can report a particular item only once (enforced via unique index).
* Admins can filter by `status` to process new reports.
* Actions like hiding/removing content would be handled externally by the moderator/admin dashboard logic.

