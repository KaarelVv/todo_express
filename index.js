const express = require("express");
const app = express();
const fs = require('fs');

// use ejs files to prep template for views
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  // get tasks from file
  fs.readFile('./tasks', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const tasks = data.split("\n")
    res.render("index", { tasks: tasks });
  });
});

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  console.log('form sent data');
  console.log(req.body);
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
