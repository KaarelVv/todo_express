const { error } = require("console");
const { promises } = require("dns");
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
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      // tasks list data from file
      const tasks = JSON.parse(data)
      resolve(tasks)
    });
  })
}

const writeFile = (filename, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, 'utf-8', err => {
      if (err) {
        console.log(err)
        return;
      }
      resolve(true)
    })
  })
}

app.get('/', (req, res) => {
  // get tasks from file
  readFile('./tasks.json')
    .then(tasks => {
      // console.log(tasks)
      res.render('index', { tasks: tasks, error: null })
    })
});

app.get('/update/:taskId', (req, res) => {
  // get tasks from file
  readFile('./tasks.json')
    .then(tasks => {
      const taskId = Number(req.params.taskId);
      const task = tasks.find(t => t.id === taskId);
      console.log('Task for updating =>', task)
      //       let task;
      // for (const t of tasks) {
      //   if (t.id === taskId) {
      //     task = t;
      //     break;
      //   }
      //   }
      res.render('update', { task, error: null });

    })
});

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  // control data from file
  let error = null
  if (req.body.task.trim().length == 0) {
    error = 'Please insert correct task data'
    readFile('./tasks.json')
      .then(tasks => {
        res.render('index', {
          tasks: tasks,
          error: error
        })
      })

  } else {
    // task list data from file
    readFile('./tasks.json')
      .then(tasks => {
        // add new task
        // create new id automatically
        let index
        if (tasks.length === 0) {
          index = 1
        } else {
          index = tasks[tasks.length - 1].id + 1;
        }
        // create task object
        const newTask = {
          "id": index,
          "task": req.body.task
        }
        console.log(newTask);
        // add form sent task to task array
        tasks.push(newTask);
        console.log(tasks);
        data = JSON.stringify(tasks, null, 2);
        console.log(data);

        writeFile('tasks.json', data)
        // redirect to / to see result
        res.redirect('/')
      })
  }
})

app.post('/update-task/', (req, res) => {

  const updatedTaskId = Number(req.body.id);
  const updatedTask = (req.body.task);
  const task = req.body;

  // console.log('Task Id: ', updatedTaskId);
  // console.log('Task name: ', updatedTask);
  console.log('Task data from update form => ', task)
  let error = null
  if (req.body.task.trim().length == 0) {
    error = 'Please insert correct task data'
    readFile('./tasks.json')
      .then(tasks => {
        const taskId = updatedTaskId;
        const task = tasks.find(t => t.id === taskId);
        res.render('update', { task, error: error });
      });

  } else {
    readFile('./tasks.json')
      .then(tasks => {

        for (var i = 0; i < tasks.length; i++) {
          if (tasks[i].id == updatedTaskId) {
            tasks[i].task = updatedTask;
            // console.log('updated ', tasks)
          }
        }
        data = JSON.stringify(tasks, null, 2);
        writeFile('tasks.json', data);
        res.redirect('/')
      })
  }
})

app.get('/delete-task/:taskId', (req, res) => {
  let deletedTaskId = (req.params.taskId);
  readFile('./tasks.json')
    .then(tasks => {
      tasks.forEach((task, index) => {
        if (task.id == deletedTaskId) {
          tasks.splice(index, 1)
        }
      })
      data = JSON.stringify(tasks, null, 2)

      writeFile('tasks.json', data)
      res.redirect('/');
    })
})

app.get('/delete-all-tasks/', (req, res) => {
  readFile('./tasks.json')
    .then(tasks => {
      console.log(tasks);
      // when there are tasks, go into method
      if (tasks.length !== 0) {
        // create empty object
        const emptyTasks = []
        // converts into JSON object
        data = JSON.stringify(emptyTasks);
      }
      // writes empty file over existing file
      writeFile('tasks.json', data)
      // if file is not empty, redirects to index page
      res.redirect('/')
    })
})


app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001/");
})