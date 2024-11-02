// Import the 'error' property from the 'console' module (not used in this code)
const { error } = require("console");

// Import 'promises' from the 'dns' module (not used in this code)
const { promises } = require("dns");

// Import Express framework
const express = require("express");
const app = express(); // Create an Express application

// Import the 'fs' module for file operations
const fs = require('fs');

// Import the 'path' module to work with file and directory paths
const path = require("path");

// Set EJS as the templating engine for rendering views
app.set("view engine", "ejs");

// Set the directory for EJS templates
app.set("views", path.join(__dirname, "views"));

// Define 'readFile' function to read a file and parse its content as JSON
const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    // Read the file with 'utf8' encoding
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        // Log error if file reading fails and return
        console.error(err);
        return;
      }
      // Parse file data as JSON and resolve the promise with the data
      const tasks = JSON.parse(data)
      resolve(tasks)
    });
  })
}

// Define 'writeFile' function to write data to a file as JSON
const writeFile = (filename, data) => {
  return new Promise((resolve, reject) => {
    // Write the data to file with 'utf8' encoding
    fs.writeFile(filename, data, 'utf-8', err => {
      if (err) {
        // Log error if file writing fails and return
        console.log(err)
        return;
      }
      // Resolve the promise if writing succeeds
      resolve(true)
    })
  })
}

// Define route for the root path
app.get('/', (req, res) => {
  // Read tasks from 'tasks.json' and render the 'index' view with tasks
  readFile('./tasks.json')
    .then(tasks => {
      res.render('index', { tasks: tasks, error: null })
    })
});

// Define route to display a specific task for updating
app.get('/update/:taskId', (req, res) => {
  // Read tasks from 'tasks.json'
  readFile('./tasks.json')
    .then(tasks => {
      // Convert 'taskId' from string to number
      const taskId = Number(req.params.taskId);
      // Find the task with the matching 'taskId'
      const task = tasks.find(t => t.id === taskId);
      // Render the 'update' view with the selected task
      res.render('update', { task, error: null });
    })
});

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Define POST route to add a new task
app.post('/', (req, res) => {
  let error = null;
  
  // Check if task input is empty
  if (req.body.task.trim().length == 0) {
    error = 'Please insert correct task data';
    // If input is empty, render 'index' with an error message
    readFile('./tasks.json')
      .then(tasks => {
        res.render('index', {
          tasks: tasks,
          error: error
        });
      });
  } else {
    // If input is valid, read tasks, add new task, and save to 'tasks.json'
    readFile('./tasks.json')
      .then(tasks => {
        // Determine the ID for the new task
        let index = tasks.length === 0 ? 1 : tasks[tasks.length - 1].id + 1;
        // Create a new task object
        const newTask = {
          "id": index,
          "task": req.body.task
        };
        // Add the new task to the tasks array
        tasks.push(newTask);
        // Convert tasks to JSON format
        data = JSON.stringify(tasks, null, 2);
        // Save updated tasks to 'tasks.json' and redirect to the root
        writeFile('tasks.json', data)
        res.redirect('/')
      })
  }
});

// Define POST route to update an existing task
app.post('/update-task/', (req, res) => {
  const updatedTaskId = Number(req.body.id); // Convert task ID from form to a number
  const updatedTask = req.body.task; // Get the updated task description
  
  let error = null;
  
  // Check if updated task input is empty
  if (req.body.task.trim().length == 0) {
    error = 'Please insert correct task data';
    // If input is empty, re-render 'update' view with an error
    readFile('./tasks.json')
      .then(tasks => {
        const taskId = updatedTaskId;
        const task = tasks.find(t => t.id === taskId);
        res.render('update', { task, error: error });
      });
  } else {
    // If input is valid, read tasks, find and update the task, and save to 'tasks.json'
    readFile('./tasks.json')
      .then(tasks => {
        // Update the specified task in the array
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].id == updatedTaskId) {
            tasks[i].task = updatedTask;
          }
        }
        // Convert tasks to JSON format
        data = JSON.stringify(tasks, null, 2);
        // Save updated tasks to 'tasks.json' and redirect to the root
        writeFile('tasks.json', data);
        res.redirect('/')
      })
  }
});

// Define GET route to delete a task by ID
app.get('/delete-task/:taskId', (req, res) => {
  let deletedTaskId = req.params.taskId; // Get the ID of the task to delete
  
  // Read tasks from 'tasks.json'
  readFile('./tasks.json')
    .then(tasks => {
      // Remove the task with the matching ID
      tasks.forEach((task, index) => {
        if (task.id == deletedTaskId) {
          tasks.splice(index, 1); // Remove the task from the array
        }
      });
      // Convert updated tasks to JSON format
      data = JSON.stringify(tasks, null, 2);
      // Save updated tasks to 'tasks.json' and redirect to the root
      writeFile('tasks.json', data)
      res.redirect('/');
    })
});

// Define GET route to delete all tasks
app.get('/delete-all-tasks/', (req, res) => {
  // Read tasks from 'tasks.json'
  readFile('./tasks.json')
    .then(tasks => {
      // If tasks exist, clear the array
      if (tasks.length !== 0) {
        const emptyTasks = []; // Create an empty array
        // Convert empty array to JSON format
        data = JSON.stringify(emptyTasks);
      }
      // Overwrite 'tasks.json' with the empty array and redirect to root
      writeFile('tasks.json', data)
      res.redirect('/')
    })
})

// Start the server on port 3001 and log a message when it's running
app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001/");
});