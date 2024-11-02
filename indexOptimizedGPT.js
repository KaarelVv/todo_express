const express = require("express");
const app = express();
const fs = require("fs").promises;
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const readFile = async (filename) => {
  try {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const writeFile = async (filename, data) => {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(err);
  }
};

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const tasks = await readFile("./tasks.json");
  res.render("index", { tasks, error: null });
});

app.get("/update/:taskId", async (req, res) => {
  const tasks = await readFile("./tasks.json");
  const task = tasks.find((t) => t.id === Number(req.params.taskId));
  res.render("update", { task, error: null });
});

app.post("/", async (req, res) => {
  if (!req.body.task.trim()) {
    const tasks = await readFile("./tasks.json");
    res.render("index", { tasks, error: "Please insert correct task data" });
  } else {
    const tasks = await readFile("./tasks.json");
    const newTask = {
      id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
      task: req.body.task.trim(),
    };
    tasks.push(newTask);
    await writeFile("./tasks.json", tasks);
    res.redirect("/");
  }
});

app.post("/update-task", async (req, res) => {
  const updatedTaskId = Number(req.body.id);
  const updatedTask = req.body.task.trim();

  if (!updatedTask) {
    const tasks = await readFile("./tasks.json");
    const task = tasks.find((t) => t.id === updatedTaskId);
    res.render("update", { task, error: "Please insert correct task data" });
  } else {
    const tasks = await readFile("./tasks.json");
    const taskIndex = tasks.findIndex((t) => t.id === updatedTaskId);

    if (taskIndex !== -1) {
      tasks[taskIndex].task = updatedTask;
      await writeFile("./tasks.json", tasks);
    }
    res.redirect("/");
  }
});

app.get("/delete-task/:taskId", async (req, res) => {
  const tasks = await readFile("./tasks.json");
  const updatedTasks = tasks.filter((task) => task.id !== Number(req.params.taskId));
  await writeFile("./tasks.json", updatedTasks);
  res.redirect("/");
});

app.get("/delete-all-tasks", async (req, res) => {
  await writeFile("./tasks.json", []);
  res.redirect("/");
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001/");
});

// Key changes
// Promise Simplification: fs.promises is used to directly work with async/await for file operations, making the code more concise.
// Error Handling: readFile and writeFile functions include error handling to prevent the program from crashing if file operations fail.
// ID Management: Task ID generation is handled inline, making it more readable.
// filter for Deletion: Array.filter() is used for task deletion, simplifying the code.