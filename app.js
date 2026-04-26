const baseURL = "https://todoapp-b837a-default-rtdb.firebaseio.com/todos";

// ================= ADD TASK =================
document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const task = {
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    list: document.getElementById("list").value,
    Date: document.getElementById("Date").value,
    isCompleted: false,
    isDeleted: false
  };

  fetch(`${baseURL}.json`, {
    method: "POST",
    body: JSON.stringify(task)
  }).then(() => getTasks());

  this.reset(); 
});

// ================= GET =================
function getTasks() {
  fetch(`${baseURL}.json`)
    .then(res => res.json())
    .then(data => {
      if (!data) return;
      renderTasks(data);
    });
}

// ================= RENDER =================
function renderTasks(data) {
  const container = document.getElementById("tasksContainer");
  container.innerHTML = "";

  for (let id in data) {
    const task = data[id];
 
    if (task.isDeleted) continue;

    const div = document.createElement("div");
    div.className = "task";

    if (task.isCompleted) div.classList.add("completed");

    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>🔥 ${task.priority}</p>
      <p>📅 ${task.Date}</p>

      <button onclick="toggleComplete('${id}', ${task.isCompleted})">✔</button>
      <button onclick="deleteTask('${id}')">🗑</button>
    `;
    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>🔥 ${task.priority}</p>
      <p>📅 ${task.Date}</p>

      <button onclick="toggleComplete('${id}', ${task.isCompleted})">✔</button>
      <button onclick="editTask('${id}', '${task.title}')">✏</button>
     <button onclick="deleteTask('${id}')">🗑</button>
     `;

    container.appendChild(div);
  }
}

// ================= COMPLETE =================
function toggleComplete(id, status) {
  fetch(`${baseURL}/${id}.json`, {
    method: "PATCH",
    body: JSON.stringify({
      isCompleted: !status
    })
  }).then(() => getTasks());
}

// ================= EDIT =================
function editTask(id, oldTitle) {
   let newTitle = prompt("Edit task:", oldTitle);

  if (newTitle) {
    fetch(`${baseURL}/${id}.json`, {
      method: "PATCH",
      body: JSON.stringify({ title: newTitle })
    }).then(() => getTasks());
  }
}

// ================= DELETE =================
function deleteTask(id) {
  fetch(`${baseURL}/${id}.json`, {
    method: "PATCH",
    body: JSON.stringify({
      isDeleted: true
    })
  }).then(() => getTasks());
}


// ================= FILTER =================
function filterHigh(data) {
  let filtered = {};
  for (let id in data) {
    if (data[id].priority === "high") {
      filtered[id] = data[id];
    }
  }
  renderTasks(filtered);
}

// ================= SEARCH =================
document.getElementById("search").addEventListener("input", function () {
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

// ================= INIT =================
getTasks();
