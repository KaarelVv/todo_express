const express = require("express");
const app = express();
const fs = require('fs');

// use ejs files to prep template for views
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    // get tasks from file
    fs.readFile('./tasks', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      // tasks list data from file
      const tasks = data.split("\n")
      resolve(tasks)
    });
  })
}
app.get('/', (req, res) => {
  // get tasks from file
  readFile('./tasks')
    .then(tasks => {
      console.log(tasks)
      res.render('index', { tasks: tasks })
    })
});

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  // task list data from file
  readFile('./tasks')
    .then(tasks => {
      // add form sent task to task array
      tasks.push(req.body.task);
      const data = tasks.join("\n");
      fs.writeFile('./tasks', data, err => {
        if(err){
          console.error(err);
          return;
        } 
        // redirect to / to see result
        res.redirect('/');
      } )
      console.log(data);
    })
})


app.listen(3001, () => {
  console.log("Server is running on port 3001");
})