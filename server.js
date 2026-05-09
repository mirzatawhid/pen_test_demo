const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// View Engine
app.set("view engine", "ejs");

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("User", userSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    console.log("MongoDB Connected");

    // Seed demo user
    const existing = await User.findOne({ username: "admin" });

    if (!existing) {
        await User.create({
            username: "admin",
            password: "admin123"
        });
        console.log("Demo user created");
    }

    // Home page
    app.get("/", (req, res) => {
        res.render("login");
    });

    // =========================
    // VULNERABLE LOGIN (DEMO)
    // =========================
    app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    try {

        const user = await User.findOne({
            username: username,
            password: password
        });

        if (user) {

            const token = Buffer.from(
                "FLAG{NOSQL_INJECTION_SUCCESS}"
            ).toString("base64");

            return res.render("result", {
                success: true,
                username: user.username,
                token: token,
                message: "Login Successful"
            });

        } else {

            return res.render("result", {
                success: false,
                username: null,
                token: null,
                message: "Login Failed"
            });
        }

    } catch (err) {

        return res.render("result", {
            success: false,
            username: null,
            token: null,
            message: "Server Error"
        });
    }
    });

    // Test route
    app.get("/test", (req, res) => {
        res.send("Server Working");
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

})
.catch(err => {
    console.log("MongoDB Connection Failed");
    console.log(err);
});