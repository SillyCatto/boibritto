import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../api/models/user.models.js";
import Collection from "../api/models/collection.models.js";
import ReadingList from "../api/models/readingList.models.js";
import Blog from "../api/models/blog.models.js";
import { GENRES } from '../api/utils/constants.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variables
    const connectionString = process.env.MONGODB_URL;

    if (!connectionString) {
      throw new Error("MONGODB_URL environment variable is not set");
    }

    await mongoose.connect(connectionString);
    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Sample Google Books volume IDs (real book IDs from Google Books API)
const sampleBooks = [
  "zyTCAlFPjgYC", // The Google story
  "kJHuAAAAMAAJ", // Harry Potter and the Philosopher's Stone
  "wrOQLV6xB-wC", // The Pragmatic Programmer
  "4LACCwAAQBAJ", // Clean Code
  "B6iTDwAAQBAJ", // Atomic Habits
  "IwywDwAAQBAJ", // The Silent Patient
  "jAUODAAAQBAJ", // Where the Crawdads Sing
  "lFhbDwAAQBAJ", // Educated
  "NgVmDwAAQBAJ", // Becoming
  "PZ3OCwAAQBAJ", // The Seven Husbands of Evelyn Hugo
];

// Sample blog content with Markdown formatting
const blogPosts = [
  {
    title: "The Magic of Fantasy Literature",
    content: `# The Magic of Fantasy Literature

Fantasy literature has always been a **gateway to imagination**. From Tolkien's *Middle-earth* to Brandon Sanderson's *Cosmere*, these worlds offer us escape and wonder.

## What Makes Fantasy Special?

- **Intricate magic systems** that follow their own rules
- **Complex characters** with depth and growth
- **Epic storylines** that span across multiple books

### My Top Fantasy Recommendations:

1. **The Lord of the Rings** by J.R.R. Tolkien
2. **The Stormlight Archive** by Brandon Sanderson
3. **The Name of the Wind** by Patrick Rothfuss

> "Fantasy is not an escape from reality; it is a tool to better understand and cope with reality." - Anonymous

These worlds create an immersive experience that stays with readers long after the final page.`,
    genres: ["fantasy"],
    spoilerAlert: false,
    visibility: "public",
  },
  {
    title: "Why Science Fiction Matters More Than Ever",
    content: `# Why Science Fiction Matters More Than Ever

In our rapidly advancing technological world, **science fiction** serves as both a warning and a guide.

## The Prophetic Power of Sci-Fi

Authors like *Isaac Asimov* and *Philip K. Dick* predicted many of today's realities:

- **Artificial Intelligence** and robot ethics
- **Genetic engineering** and its implications
- **Space exploration** and colonization
- **Virtual reality** and digital consciousness

### Key Questions Sci-Fi Helps Us Navigate:

- How do we maintain humanity in an increasingly digital world?
- What are the ethical boundaries of technological advancement?
- How do we prepare for futures we can barely imagine?

\`\`\`
"The best science fiction is about human beings, not gadgets." - Ray Bradbury
\`\`\`

Their works help us navigate the ethical implications of our technological future.`,
    genres: ["sci-fi"],
    spoilerAlert: false,
    visibility: "public",
  },
  {
    title: "The Dark Side of Gone Girl (Spoiler Alert!)",
    content: `# The Dark Side of Gone Girl ⚠️ **MAJOR SPOILERS AHEAD**

## Warning: This post contains major plot spoilers for Gone Girl!

---

*Gone Girl* by Gillian Flynn is a masterclass in psychological manipulation and unreliable narration.

### Amy Dunne: The Perfect Psychopath

Amy's character reveals uncomfortable truths about:

- **Manipulation tactics** in relationships
- **Media influence** on public perception
- **The facade of perfect marriages**

#### Key Moments That Shocked Me:

1. **The diary revelation** - Everything was fabricated
2. **Desi's murder** - Amy's calculated escape plan
3. **The final confrontation** - Nick's trapped forever

> Amy Dunne's manipulation shows how we can never truly know another person, even those closest to us.

### The Unreliable Narrator Technique

Flynn brilliantly uses:
- **Dual perspectives** that contradict each other
- **False evidence** planted throughout
- **Reader manipulation** - we become victims too

**Rating: ⭐⭐⭐⭐⭐**

This book will make you question everything about trust and marriage.`,
    genres: ["mystery", "thriller"],
    spoilerAlert: true,
    visibility: "public",
  },
  {
    title: "Personal Growth Through Non-Fiction",
    content: `# Personal Growth Through Non-Fiction 📚

Reading **self-help** and **personal development** books has transformed my perspective on life.

## My Transformation Journey

### Before vs After Reading:
| Before | After |
|--------|--------|
| Procrastination | Productive habits |
| Unclear goals | SMART objectives |
| Reactive mindset | Proactive approach |

## Essential Books That Changed My Life:

### 1. 📈 *Atomic Habits* by James Clear
- **Key Takeaway**: 1% better every day
- **Practical Tip**: The 2-minute rule for habit formation

### 2. 🎯 *The 7 Habits of Highly Effective People* by Stephen Covey
- **Key Takeaway**: Begin with the end in mind
- **Practical Tip**: Weekly planning sessions

### 3. 🧠 *Mindset* by Carol Dweck
- **Key Takeaway**: Growth vs fixed mindset
- **Practical Tip**: Embrace challenges as learning opportunities

## My Reading System:

\`\`\`markdown
1. Read actively with highlights
2. Take notes in a dedicated journal
3. Implement one concept per week
4. Review and reflect monthly
\`\`\`

> "The more that you read, the more things you will know. The more that you learn, the more places you'll go." - Dr. Seuss

These books provide **practical frameworks** for improvement and success.`,
    genres: ["self-help"],
    spoilerAlert: false,
    visibility: "public",
  },
  {
    title: "The Power of Historical Fiction",
    content: `# The Power of Historical Fiction 🏛️

Historical fiction allows us to **experience different eras** through compelling narratives.

## Why Historical Fiction Matters

Unlike dry history textbooks, historical fiction:

- ✨ **Brings history to life** with human stories
- 💝 **Fosters empathy** for people of different times
- 🧩 **Fills in the gaps** history books leave behind
- 🎭 **Shows multiple perspectives** on historical events

### Books That Transported Me Through Time:

#### 📖 *The Book Thief* by Marcus Zusak
**Setting**: Nazi Germany
**Perspective**: Death as narrator
**Impact**: Made me understand the power of words during dark times

#### ⚔️ *All Quiet on the Western Front* by Remarque
**Setting**: WWI trenches
**Perspective**: Young German soldier
**Impact**: Showed the true cost of war on individuals

#### 🌸 *Memoirs of a Geisha* by Arthur Golden
**Setting**: 1930s-1940s Japan
**Perspective**: Geisha's journey
**Impact**: Revealed a hidden world of tradition and survival

## The Immersive Experience

> Historical fiction doesn't just teach us about the past—it helps us understand the present and prepare for the future.

### What I Love Most:
- **Authentic details** that make you feel present
- **Complex characters** facing historical challenges
- **Moral dilemmas** that transcend time periods

These books foster **empathy and understanding** in ways textbooks never could.

---

*What's your favorite historical fiction? Drop a comment below! 👇*`,
    genres: ["historical", "fiction"],
    spoilerAlert: false,
    visibility: "private",
  },
];

const createDummyData = async (userEmail) => {
  try {
    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error("User not found with email:", userEmail);
      return;
    }

    console.log(
      `Creating dummy data for user: ${user.displayName} (${user.email})`
    );

    // Create Collections
    const collections = [
      {
        user: user._id,
        title: "My Favorite Sci-Fi Books",
        description:
          "A collection of mind-bending science fiction novels that changed my perspective",
        books: [
          { volumeId: sampleBooks[0] },
          { volumeId: sampleBooks[2] },
          { volumeId: sampleBooks[3] },
        ],
        tags: ["sci-fi", "favorites", "mind-bending"],
        visibility: "public",
      },
      {
        user: user._id,
        title: "Books That Made Me Cry",
        description: "Emotional rollercoasters that left me in tears",
        books: [
          { volumeId: sampleBooks[5] },
          { volumeId: sampleBooks[6] },
          { volumeId: sampleBooks[7] },
        ],
        tags: ["emotional", "tear-jerker", "drama"],
        visibility: "friends",
      },
      {
        user: user._id,
        title: "Programming Must-Reads",
        description: "Essential books for every software developer",
        books: [{ volumeId: sampleBooks[2] }, { volumeId: sampleBooks[3] }],
        tags: ["programming", "tech", "career"],
        visibility: "public",
      },
    ];

    const createdCollections = await Collection.insertMany(collections);
    console.log(`Created ${createdCollections.length} collections`);

    // Create Reading List entries
    const readingListEntries = [
      {
        user: user._id,
        volumeId: sampleBooks[0],
        status: "completed",
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[1],
        status: "reading",
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[4],
        status: "interested",
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[5],
        status: "completed",
        startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        visibility: "friends",
      },
      {
        user: user._id,
        volumeId: sampleBooks[6],
        status: "reading",
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        visibility: "private",
      },
      {
        user: user._id,
        volumeId: sampleBooks[7],
        status: "interested",
        visibility: "public",
      },
    ];

    const createdReadingList = await ReadingList.insertMany(readingListEntries);
    console.log(`Created ${createdReadingList.length} reading list entries`);

    // Create Blog posts
    const blogs = blogPosts.map((post) => ({
      ...post,
      user: user._id,
    }));

    const createdBlogs = await Blog.insertMany(blogs);
    console.log(`Created ${createdBlogs.length} blog posts`);

    console.log("\n✅ Dummy data created successfully!");
    console.log(`📚 Collections: ${createdCollections.length}`);
    console.log(`📖 Reading List entries: ${createdReadingList.length}`);
    console.log(`✍️ Blog posts: ${createdBlogs.length}`);
  } catch (error) {
    console.error("Error creating dummy data:", error);
  }
};

// entry point
const main = async () => {
  await connectDB();

  // replace with the actual user email you want to create data for
  const userEmail = "user@gmail.com";

  await createDummyData(userEmail);

  await mongoose.connection.close();
  console.log("\nDatabase connection closed");
};

// run the script
main().catch(console.error);
