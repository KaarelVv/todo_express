const express = require("express");
const app = express();
const fs = require('fs');

// use ejs files to prep template for views
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  // get tasks from file
fs.readFile('./tasks', 'utf8', (err,data) =>{
    if(err){
        console.error(err);
        return;
    } 
    console.log(data);
    console.log(typeof data);
    console.log(data.split("\n"));
} );
  // tasks list data
  const tasks = ["Study HTML", "Study CSS", "Study JS", "Study OOP"];
  res.render("index", { tasks: tasks });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
