const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Static Folder
app.use(express.static("public"));

// View Engine
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;


// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("User", userSchema);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(async () => {

    console.log("MongoDB Connected");


    // Create Demo User
    const existing = await User.findOne({
        username: "admin"
    });

    if (!existing) {

        await User.create({
            username: "admin",
            password: "admin123"
        });

        console.log("Demo user created");
    }


    // Home Page
    app.get("/", (req, res) => {
        res.render("login");
    });


    // Vulnerable Login
    app.post("/login", async (req, res) => {

        let username;
        let password;

        try {

            // INTENTIONALLY VULNERABLE
            username = JSON.parse(req.body.username);
            password = JSON.parse(req.body.password);

        } catch (err) {

            return res.send("Invalid JSON");
        }

        const user = await User.findOne({
            username: username,
            password: password
        });

        if (user) {

            const token = Buffer.from(
                "FLAG{NOSQL_INJECTION_SUCCESS}"
            ).toString("base64");

            res.send(`
                <h1>Login Successful</h1>

                <p>User: ${user.username}</p>

                <p>Token: ${token}</p>
            `);

        } else {

            res.send("<h1>Login Failed</h1>");
        }

    });


    // Test Route
    app.get("/test", (req, res) => {
        res.send("Server Working");
    });


    // Start Server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

})
.catch(err => {

    console.log("MongoDB Connection Failed");
    console.log(err);

});