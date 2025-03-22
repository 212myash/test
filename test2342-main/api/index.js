import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

const MONGO_URI = "mongodb+srv://212myashraj:FNaWFWjBCJhWUijZ@cluster0.rwwxb.mongodb.net/";
const DB_NAME = "app";

let db;

async function connectToDatabase() {
    if (!db) {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log("Connected to MongoDB");
    }
    return db;
}

// GET users
app.get("/api/posts", async (req, res) => {
    try {
        const database = await connectToDatabase();
        const collection = database.collection("test");
        const users = await collection.find({}, { projection: { _id: 0 } }).toArray();
        res.json({ users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/arts", async (req, res) => {
    try {
        const database = await connectToDatabase();
        const collection = database.collection("h");
        const users = await collection.find({}, { projection: { _id: 0 } }).toArray();
        res.json({ users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/:id", async (req, res) => { 
    try {
        const database = await connectToDatabase();
        const collectionName = req.params.id; // Get collection name from URL parameter
        const collection = database.collection(collectionName);  
        
        const users = await collection.find({}, { projection: { _id: 0 } }).toArray();
        res.json({ users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// POST to create a new entry
app.post("/api/posts", async (req, res) => {
    try {
        const { image, name, state, description } = req.body;

        if (!image || !name || !state || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const database = await connectToDatabase();
        const collection = database.collection("test");
        
        const newPost = { image, name, state, description };
        await collection.insertOne(newPost);
        
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/users/register", async (req, res) => {
    try {
        const { name, user_name, phone, dob, gender, password } = req.body;

        if (!name || !user_name || !phone || !dob || !gender || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const database = await connectToDatabase();
        const usersCollection = database.collection("users");

        const existingUser = await usersCollection.findOne({ user_name });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const newUser = { name, user_name, phone, dob, gender, password };
        await usersCollection.insertOne(newUser);

        res.status(201).json({ message: "User registered successfully", user: { name, user_name, phone, dob, gender } });

    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login User
app.post("/api/users/login", async (req, res) => {
    try {
        const { user_name, password } = req.body;

        if (!user_name || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const database = await connectToDatabase();
        const usersCollection = database.collection("users");

        const user = await usersCollection.findOne({ user_name, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        res.json({ message: "Login successful", user: { name: user.name, user_name: user.user_name, phone: user.phone, dob: user.dob, gender: user.gender } });

    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get User Details
app.get("/api/users/:user_name", async (req, res) => {
    try {
        const { user_name } = req.params;

        const database = await connectToDatabase();
        const usersCollection = database.collection("users");

        const user = await usersCollection.findOne({ user_name }, { projection: { _id: 0, password: 0 } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);

    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/users/forget", async (req, res) => {
    try {
        const { user_name, new_password } = req.body;

        if (!user_name || !new_password) {
            return res.status(400).json({ error: "Username and new password are required" });
        }

        const database = await connectToDatabase();
        const usersCollection = database.collection("users");

        // Check if the user exists
        const user = await usersCollection.findOne({ user_name });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the password
        await usersCollection.updateOne(
            { user_name },
            { $set: { password: new_password } }
        );

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default app;