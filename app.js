// ================= FIREBASE IMPORTS =================
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyCNhmCo-WzO97DGm_OOfAH9EsQDvm7F5ec",
  authDomain: "todoapp-b837a.firebaseapp.com",
  databaseURL: "https://todoapp-b837a-default-rtdb.firebaseio.com",
  projectId: "todoapp-b837a",
  storageBucket: "todoapp-b837a.firebasestorage.app",
  messagingSenderId: "740866716833",
  appId: "1:740866716833:web:3b6494566b7cc2d4b62ce0",
  measurementId: "G-PRV3886FZD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ================= WEATHER =================
const weatherApiKey = "62ca1d72ab9b95c801aac13e542ead4e";
const city = "Amman";

// ================= GLOBAL USER =================
let currentUser = null;


// ================= REGISTER =================
function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Registered Successfully"))
    .catch(err => alert(err.message));
}


// ================= LOGIN =================
function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Login Success"))
    .catch(err => alert(err.message));
}


// ================= LOGOUT =================
function logoutUser() {
  signOut(auth)
    .then(() => {
      currentUser = null;

      document.getElementById("authBox").style.display = "block";
      document.getElementById("appBox").style.display = "none";
    })
    .catch(err => alert(err.message));
}
// ================= AUTH STATE =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;

    document.getElementById("authBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";

    getTasks();
  } else {
    currentUser = null;

    document.getElementById("authBox").style.display = "block";
    document.getElementById("appBox").style.display = "none";
  }
});


// ================= ADD TASK =================
document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentUser) return;

  const task = {
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    list: document.getElementById("list").value,
    Date: document.getElementById("Date").value,
    isCompleted: false,
    isDeleted: false
  };

  const userRef = ref(db, `todos/${currentUser.uid}`);

  push(userRef, task).then(() => getTasks());

  this.reset();
});


// ================= GET TASKS =================
function getTasks() {
  if (!currentUser) return;

  const userRef = ref(db, `todos/${currentUser.uid}`);

  get(userRef).then(snapshot => {
    if (snapshot.exists()) {
      renderTasks(snapshot.val());
    } else {
      document.getElementById("tasksContainer").innerHTML = "";
    }
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
      <button onclick="editTask('${id}', '${task.title}')">✏</button>
      <button onclick="deleteTask('${id}')">🗑</button>
    `;

    container.appendChild(div);
  }
}


// ================= COMPLETE =================
function toggleComplete(id, status) {
  const taskRef = ref(db, `todos/${currentUser.uid}/${id}`);

  update(taskRef, {
    isCompleted: !status
  }).then(() => getTasks());
}


// ================= EDIT =================
function editTask(id, oldTitle) {
  let newTitle = prompt("Edit task:", oldTitle);

  if (newTitle) {
    const taskRef = ref(db, `todos/${currentUser.uid}/${id}`);

    update(taskRef, {
      title: newTitle
    }).then(() => getTasks());
  }
}


// ================= DELETE =================
function deleteTask(id) {
  const taskRef = ref(db, `todos/${currentUser.uid}/${id}`);

  update(taskRef, {
    isDeleted: true
  }).then(() => getTasks());
}


// ================= SEARCH =================
document.getElementById("search").addEventListener("input", function () {
  const value = this.value.toLowerCase();

  if (!currentUser) return;

  const userRef = ref(db, `todos/${currentUser.uid}`);

  get(userRef).then(snapshot => {
    if (!snapshot.exists()) return;

    let data = snapshot.val();
    let filtered = {};

    for (let id in data) {
      if (data[id].title.toLowerCase().includes(value)) {
        filtered[id] = data[id];
      }
    }

    renderTasks(filtered);
  });
});


// ================= WEATHER =================
function getWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {

      const weatherBox = document.getElementById("weatherBox");

      if (data.cod !== 200) {
        weatherBox.innerHTML = `<p>⚠ ${data.message}</p>`;
        return;
      }

      weatherBox.innerHTML = `
        <h4>📍 ${data.name}</h4>
        <p>🌡 ${data.main.temp}°C</p>
        <p>☁ ${data.weather[0].main}</p>
        <p>💨 ${data.wind.speed} m/s</p>
      `;
    })
    .catch(() => {
      document.getElementById("weatherBox").innerHTML =
        "<p>Weather unavailable</p>";
    });
}


// ================= GLOBAL EXPORTS (IMPORTANT) =================
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.toggleComplete = toggleComplete;
window.editTask = editTask;
window.deleteTask = deleteTask;


// ================= INIT =================
getWeather();