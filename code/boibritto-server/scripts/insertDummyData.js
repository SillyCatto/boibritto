import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../api/models/user.models.js";
import Collection from "../api/models/collection.models.js";
import ReadingList from "../api/models/readingList.models.js";
import Blog from "../api/models/blog.models.js";
import { GENRES } from "../api/utils/constants.js";

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

// Sample Google Books volume IDs (real book IDs from Google Books API) - Set 2
const sampleBooks = [
  "4jhBCwAAQBAJ", // 1984 by George Orwell
  "yxv1LK5gyxsC", // To Kill a Mockingbird
  "74XNzF_al3MC", // The Great Gatsby
  "2aClDAAAQBAJ", // Sapiens: A Brief History of Humankind
  "K3GgCwAAQBAJ", // The Midnight Library
  "Oa1pDwAAQBAJ", // Circe by Madeline Miller
  "q7l8DwAAQBAJ", // Little Fires Everywhere
  "UdCuDwAAQBAJ", // The Testaments
  "AaVMDwAAQBAJ", // Normal People
  "7FmEDwAAQBAJ", // The Vanishing Half
];

// Sample blog content with Markdown formatting - Set 2
const blogPosts = [
  {
    title: "Dystopian Literature: A Mirror to Our Society",
    content: `# Dystopian Literature: A Mirror to Our Society 🔮

Reading dystopian fiction has become more relevant than ever in our current world.

## Why Dystopian Fiction Resonates

Dystopian novels serve as **warning systems** for society:

- 📱 **Technology overreach** and surveillance
- 🏛️ **Government control** and authoritarianism
- 🧬 **Social manipulation** and propaganda
- 🌍 **Environmental destruction** and consequences

### Essential Dystopian Reads:

#### 📖 *1984* by George Orwell
> "Big Brother is watching you."

**Key Themes:**
- Surveillance state
- Thought control
- Reality manipulation

#### 🔥 *Fahrenheit 451* by Ray Bradbury
**Warning:** Books are banned and burned
**Lesson:** The danger of censorship and ignorance

#### 🏹 *The Hunger Games* by Suzanne Collins
**Setting:** Post-apocalyptic North America
**Focus:** Class warfare and media manipulation

## Modern Parallels

These books predicted many aspects of our digital age:
- Social media echo chambers
- Fake news and propaganda
- Digital surveillance
- Algorithm-controlled information

*What dystopian book has impacted you the most? These novels continue to shape our understanding of power, freedom, and resistance.*`,
    genres: ["dystopian", "fiction"],
    spoilerAlert: false,
    visibility: "public",
  },
  {
    title: "Book Club Recommendations: Building Community Through Reading",
    content: `# Book Club Recommendations: Building Community Through Reading 📚👥

Starting a book club has been one of the **best decisions** I've made for my reading journey!

## Benefits of Book Clubs

### 📖 Enhanced Understanding
- **Multiple perspectives** on the same story
- **Deeper discussions** about themes and characters
- **Cultural insights** from diverse members

### 🤝 Social Connection
- **New friendships** formed over shared interests
- **Regular social activity** to look forward to
- **Support system** for reading goals

## Perfect Book Club Picks

### Fiction That Sparks Discussion:

#### 🌟 *The Seven Husbands of Evelyn Hugo*
- **Discussion Points:** Fame, love, sacrifice
- **Why It Works:** Multiple plot twists to unpack
- **Meeting Ideas:** Hollywood-themed snacks

#### 📚 *Little Fires Everywhere*
- **Discussion Points:** Motherhood, privilege, secrets
- **Why It Works:** Moral complexity in every character
- **Meeting Ideas:** Potluck dinner discussion

### Non-Fiction for Growth:

#### 🧠 *Sapiens* by Yuval Noah Harari
- **Discussion Points:** Human evolution and society
- **Why It Works:** Mind-blowing concepts to explore
- **Meeting Ideas:** Timeline creation activity

## Book Club Tips

\`\`\`markdown
📅 Meet monthly for sustainable commitment
🍷 Provide snacks to create welcoming atmosphere
📝 Prepare discussion questions in advance
🎯 Set reading pace that works for everyone
📱 Use group chat for ongoing conversations
\`\`\`

### Discussion Starters:
1. What surprised you most about this book?
2. Which character did you relate to and why?
3. How did this book change your perspective?
4. What would you ask the author if you could?

Reading becomes so much richer when shared! 💕`,
    genres: ["community", "reading"],
    spoilerAlert: false,
    visibility: "public",
  },
  {
    title: "Contemporary Fiction Gems You Shouldn't Miss",
    content: `# Contemporary Fiction Gems You Shouldn't Miss ✨

This year has been incredible for contemporary fiction! Here are my top discoveries.

## Recent Reads That Blew My Mind

### 🌙 *The Midnight Library* by Matt Haig

**Plot:** A library between life and death where you can explore alternate lives
**Why I Loved It:**
- Philosophical yet accessible
- Explores regret and possibility
- Beautiful metaphor for choice

**Favorite Quote:**
> "Between life and death there is a library, and within that library, the shelves go on forever."

### 👭 *Normal People* by Sally Rooney

**Plot:** Complex relationship between two Irish teenagers through university
**What Makes It Special:**
- **Raw, honest dialogue**
- **Realistic character development**
- **Explores class, intimacy, and mental health**

**Warning:** Contains heavy themes around depression and abuse

### 🎭 *Circe* by Madeline Miller

**Genre:** Mythological fiction
**Why It's Amazing:**
- **Feminist retelling** of Greek mythology
- **Beautiful, lyrical prose**
- **Strong character arc** of empowerment

## What Makes Great Contemporary Fiction?

1. **Relatable characters** with real flaws
2. **Current social issues** woven naturally into plot
3. **Authentic dialogue** that sounds like real people
4. **Emotional resonance** that stays with you

### Reading List for 2025:

| Book | Author | Why I'm Excited |
|------|--------|----------------|
| *The Vanishing Half* | Brit Bennett | Explores identity and family secrets |
| *Hamnet* | Maggie O'Farrell | Shakespeare's family story |
| *Klara and the Sun* | Kazuo Ishiguro | AI from unique perspective |

## My Rating System:

⭐⭐⭐⭐⭐ Life-changing, recommend to everyone
⭐⭐⭐⭐ Excellent, worth your time
⭐⭐⭐ Good, depends on your taste
⭐⭐ Okay, has some merit
⭐ Not for me

What contemporary fiction have you been loving lately? These diverse stories continue to push the boundaries of what literature can achieve.`,
    genres: ["contemporary", "fiction"],
    spoilerAlert: false,
    visibility: "public",
  },
  {
    title: "Audiobooks vs Physical Books: My Reading Revolution",
    content: `# Audiobooks vs Physical Books: My Reading Revolution 🎧📖

I used to be a **physical books only** person. Then I discovered audiobooks and everything changed!

## My Journey to Audio

### The Resistance Phase 📚❌
- *"It's not really reading!"*
- *"I won't retain information"*
- *"I'll get distracted"*
- *"It's cheating somehow"*

### The Breakthrough Moment 💡
**Book:** *Educated* by Tara Westover
**Narrator:** Julia Whelan
**Result:** I was completely absorbed for 12 hours straight

## When I Choose Audiobooks

### 🚗 **Commuting & Travel**
- Perfect for long drives
- Makes traffic bearable
- Airplane entertainment

### 🏃‍♀️ **Exercise & Chores**
- Walking becomes adventure time
- Cleaning flies by
- Gym sessions are less boring

### 😴 **Relaxation**
- Better than screen time before bed
- Helps with insomnia
- Sunday afternoon luxury

## When I Choose Physical Books

### 📝 **Complex Non-fiction**
- Need to take notes
- Reference charts/diagrams
- Want to highlight passages

### 🔍 **Dense Literary Fiction**
- Appreciate beautiful language
- Want to read slowly
- Need to flip back for details

### 📚 **Research & Study**
- Academic materials
- Technical books
- Reference guides

## The Hybrid Approach

My current strategy:
\`\`\`
📱 Audiobook for commute/exercise
📖 Physical book for evening reading
📝 Notes app for capturing thoughts
📊 Goodreads for tracking progress
\`\`\`

### Pro Tips for Audiobook Success:

1. **Start with engaging narrators** (check reviews!)
2. **Adjust speed** - I love 1.25x for most books
3. **Use sleep timer** for bedtime listening
4. **Take breaks** to process complex information
5. **Follow along** with physical copy for difficult books

## My Stats This Year:

📚 **Physical books:** 23
🎧 **Audiobooks:** 31
📖 **Total:** 54 books

**Conclusion:** Both formats have their place! The best book is the one you'll actually finish.

Each reading format serves different purposes and situations. The key is finding what works best for your lifestyle and reading goals.`,
    genres: ["reading", "lifestyle"],
    spoilerAlert: false,
    visibility: "private",
  },
  {
    title: "Underrated Authors Who Deserve More Recognition",
    content: `# Underrated Authors Who Deserve More Recognition 🌟

While everyone talks about the same bestsellers, here are some **incredible authors** flying under the radar.

## Literary Fiction Gems

### 📚 **Hanya Yanagihara**
**Known for:** *A Little Life*, *To Paradise*
**Why She's Amazing:**
- Tackles difficult subjects with sensitivity
- Creates complex, memorable characters
- Beautiful, haunting prose

**If you like:** Donna Tartt, Celeste Ng

### ✍️ **Ocean Vuong**
**Known for:** *On Earth We're Briefly Gorgeous*
**Writing Style:**
- Poetic, lyrical language
- Explores identity, family, trauma
- Vietnamese-American perspective

**Perfect for:** Readers who love beautiful language

## International Voices

### 🌍 **Chimamanda Ngozi Adichie**
**Why You Should Read Her:**
- Powerful storytelling about Nigeria
- Feminist themes done brilliantly
- *Americanah* is life-changing

### 📖 **Han Kang** (South Korean)
**Notable Work:** *The Vegetarian*
**What Makes Her Special:**
- Surreal, haunting narratives
- Explores women's autonomy
- Unique cultural perspective

## Genre Fiction Masters

### 🔮 **N.K. Jemisin**
**Genre:** Science Fiction/Fantasy
**Achievement:** First person to win Hugo Award 3 consecutive years
**Why She Matters:**
- Revolutionizing fantasy with diverse worlds
- Complex magic systems
- Social justice themes

### 🕵️ **Tana French**
**Genre:** Mystery/Literary Fiction
**What Sets Her Apart:**
- Psychological depth in crime fiction
- Beautiful writing that transcends genre
- Complex character development

## Poetry That Reads Like Stories

### ✨ **Rupi Kaur**
**Style:** Modern poetry with illustrations
**Topics:** Love, loss, healing, femininity
**Why She's Popular:** Accessible, Instagram-friendly format

### 📝 **Mary Oliver**
**Focus:** Nature poetry that's deeply spiritual
**Perfect for:** Anyone seeking peace and reflection

## How to Discover Underrated Authors

### 🔍 **Research Methods:**
- Browse independent bookstore recommendations
- Check literary magazine contributors
- Follow diverse book bloggers
- Explore translated works
- Look at award shortlists (not just winners)

### 📱 **Digital Tools:**
- Goodreads "Readers Also Enjoyed"
- BookTube recommendations
- Literary Twitter discussions
- Library staff picks

## My Challenge to You

This month, try reading:
1. ✅ One author from a country you've never read from
2. ✅ One debut novel from this year
3. ✅ One poetry collection
4. ✅ One book translated from another language

**Expanding our reading horizons** introduces us to new perspectives and storytelling styles!

Reading diverse voices enriches our understanding of the world and challenges our assumptions.

---

*Supporting diverse authors means supporting diverse stories. These voices deserve recognition and readership.*`,
    genres: ["literary", "diversity"],
    spoilerAlert: false,
    visibility: "public",
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
        title: "Classic Literature Must-Reads",
        description:
          "Timeless classics that have shaped literature and continue to inspire readers today",
        books: [
          { volumeId: sampleBooks[0] }, // 1984
          { volumeId: sampleBooks[1] }, // To Kill a Mockingbird
          { volumeId: sampleBooks[2] }, // The Great Gatsby
        ],
        tags: ["classics", "literature", "timeless"],
        visibility: "public",
      },
      {
        user: user._id,
        title: "Contemporary Women Authors",
        description:
          "Powerful voices from modern female writers exploring identity, relationships, and society",
        books: [
          { volumeId: sampleBooks[4] }, // The Midnight Library
          { volumeId: sampleBooks[6] }, // Little Fires Everywhere
          { volumeId: sampleBooks[8] }, // Normal People
        ],
        tags: ["contemporary", "women-authors", "modern"],
        visibility: "public",
      },
      {
        user: user._id,
        title: "Thought-Provoking Non-Fiction",
        description:
          "Books that challenge perspectives and expand understanding of our world",
        books: [
          { volumeId: sampleBooks[3] }, // Sapiens
          { volumeId: sampleBooks[5] }, // Circe (mythological fiction)
        ],
        tags: ["non-fiction", "philosophy", "history"],
        visibility: "friends",
      },
    ];

    const createdCollections = await Collection.insertMany(collections);
    console.log(`Created ${createdCollections.length} collections`);

    // Create Reading List entries
    const readingListEntries = [
      {
        user: user._id,
        volumeId: sampleBooks[0], // 1984
        status: "completed",
        startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[4], // The Midnight Library
        status: "reading",
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[7], // The Testaments
        status: "interested",
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[1], // To Kill a Mockingbird
        status: "completed",
        startedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        completedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // 75 days ago
        visibility: "public",
      },
      {
        user: user._id,
        volumeId: sampleBooks[8], // Normal People
        status: "reading",
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        visibility: "friends",
      },
      {
        user: user._id,
        volumeId: sampleBooks[9], // The Vanishing Half
        status: "interested",
        visibility: "private",
      },
      {
        user: user._id,
        volumeId: sampleBooks[3], // Sapiens
        status: "completed",
        startedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
        completedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
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
