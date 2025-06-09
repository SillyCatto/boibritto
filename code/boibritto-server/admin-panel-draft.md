


# Draft Admin operations
## 🔐 Authentication

> Admin actions will typically require a secure login with role-based access in the future.

* **Log in via Firebase** (same as regular users)
* **Check if logged-in user is an admin** (`GET /api/admins/me`)
* **View admin profile**
* (Optional later) **Assign/revoke admin roles** to users

---

## 🧑‍💻 Admin Management

* View all admins
* Add a new admin (by User ID or email)
* Remove admin privileges from a user
* Update admin permissions (if used in future)

---

## 👥 User Management

* View list of all users
* Search/filter users (by username, email, UID, genre, etc.)
* View user profile details
* View all public content by a user
* Temporarily suspend a user (soft-ban)
* Delete a user and all their content (dangerous action, should be rare)

---

## 🚨 Report Moderation (via `Report` Schema)

* View all reports (paginated, filter by status/content type)
* View details of a single report (user, reason, content link)
* Mark report as:

    * Reviewed
    * Dismissed (no action taken)
    * Action Taken (content removed or user warned)
* Delete reported content directly (blog, discussion, comment, book, etc.)
* Ban or warn users based on reports
* See total report count per user/content for pattern detection

---

## 📝 Blog Moderation

* View all blogs (paginated)
* Filter blogs by:

    * Visibility (public, private, friends)
    * Spoiler alert
    * Genre
    * User
* Delete a blog
* Force-update a blog (e.g., change title/visibility)
* View reported blogs

---

## 💬 Discussion Moderation

* View all discussions
* Filter by topic/genre/spoiler alert/user
* Delete a discussion
* View and delete specific comments under a discussion
* View reported discussions or comments

---

## 📚 User Books Moderation

* View all user-uploaded books
* Filter by genre/visibility/user
* View full book details (title, synopsis, chapters)
* Delete entire book
* Delete/edit specific chapters
* View reported books

---

## 📖 Reading List / Collections

* View any user's public reading list
* View any collection (especially public ones)
* Delete a collection (e.g., spam, inappropriate tags)
* Optionally: Hide specific books from a collection

---

## 📊 Dashboard Overview / Analytics (Optional Later)

* Total users
* Total blogs, discussions, user books
* Report count this week/month
* Most reported users/content
* Recently added blogs/books/discussions
* Number of currently "active" users (last 24h, etc.)

---

## 🔍 Search Tools (Global)

* Search by content ID, user ID, or volume ID
* Quick filter for "most reported items"
* Quick filter for "recently added content"

---

## 🛠️ Settings / Configurations (optional, future)

* Toggle features (e.g., temporarily disable blogs, discussions)
* Set global announcement message
* Manage app-wide genre list (if made dynamic)

---

## 📌 Suggestions

You can group these in your admin panel like:

### Tabs:

* Users
* Blogs
* Discussions
* User Books
* Reports
* Collections
* Analytics (optional)
* Settings (optional)

---

