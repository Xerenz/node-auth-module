const express = require("express");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/auth")
.then(() => {
    console.log("Mongo connected");
})
.catch(err => {
    console.log("Error connecting Mongo");
});


const app = express();

app.get("/", (req, res) => {
    res.send("Working properly");
});

PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log("listening to", PORT);
});