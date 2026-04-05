const baseURL = "https://your-project-id.firebaseio.com/tasks";

// ADD TASK
document.getElementById("taskForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const task = {
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    dueDate: document.getElementById("dueDate").value,
    isCompleted: false,
    isDeleted: false
  };

  fetch(`${baseURL}.json`, {
    method: "POST",
    body: JSON.stringify(task)
  }).then(() => getTasks());

  this.reset();
});

// GET TASKS
function getTasks() {
  fetch(`${baseURL}.json`)
    .then(res => res.json())
    .then(data => renderTasks(data));
}

// RENDER
function renderTasks(data) {
  const container = document.getElementById("tasksContainer");
  container.innerHTML = "";

  for (let id in data) {
    const task = data[id];

    if (task.isDeleted) continue;

    const div = document.createElement("div");
    div.className = "task";

    if (task.isCompleted) {
      div.classList.add("completed");
    }

    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.priority}</p>
      <p>${task.dueDate}</p>
      <button onclick="completeTask('${id}', ${task.isCompleted})">✔</button>
      <button onclick="deleteTask('${id}')">Delete</button>
    `;

    container.appendChild(div);
  }
}

// COMPLETE
function completeTask(id, currentStatus) {
  fetch(`${baseURL}/${id}.json`, {
    method: "PATCH",
    body: JSON.stringify({
      isCompleted: !currentStatus
    })
  }).then(() => getTasks());
}

// SOFT DELETE
function deleteTask(id) {
  fetch(`${baseURL}/${id}.json`, {
    method: "PATCH",
    body: JSON.stringify({
      isDeleted: true
    })
  }).then(() => getTasks());
}

// SEARCH
document.getElementById("search").addEventListener("input", function() {
  const value = this.value.toLowerCase();

  fetch(`${baseURL}.json`)
    .then(res => res.json())
    .then(data => {
      let filtered = {};

      for (let id in data) {
        if (data[id].title.toLowerCase().includes(value)) {
          filtered[id] = data[id];
        }
      }

      renderTasks(filtered);
    });
});

// LOAD
getTasks();