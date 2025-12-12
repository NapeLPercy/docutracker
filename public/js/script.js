let user = JSON.parse(sessionStorage.getItem("user"));
let infoCard = document.querySelector("#user-info-card");

// Assuming `user` object is available in the front-end
// e.g., user = { name: "John Doe", role: "MANAGER", sessionStart: Date.now() }

function renderUserCard(user) {
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-role").textContent = user.role;

  const sessionEl = document.getElementById("session-time");

  user.sessionStart = Date.now();

  function updateSessionTime() {
    const now = Date.now();
    const diff = now - user.sessionStart; // milliseconds
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    sessionEl.innerHTML = `<i class="fas fa-clock"></i> Session: ${String(
      hours
    ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  updateSessionTime();
  setInterval(updateSessionTime, 1000);
}

if (user) {
  infoCard.style.dislay = "flex";
  renderUserCard(user);

  let last = JSON.parse(sessionStorage.getItem("current-section"));
  //hide login, display=""
  document.querySelector("#logout-btn").style.display = "block";
  document.querySelector("#login-btn").style.display = "none";

  document.querySelector("#faqs-btn").style.display = "none";
  document.querySelector("#faqs").style.display = "none";

  document.querySelector("#about-btn").style.display = "none";
  document.querySelector("#about").style.display = "none";

  document.querySelector("#how-it-works-btn").style.display = "none";
  document.querySelector("#howitworks").style.display = "none";

  document.querySelector("#ai-btn").style.display = "none";
  document.querySelector("#ai-usage").style.display = "none";

  //Display user specific buttons and sections
  document.querySelector("#dashboard-btn").style.display = "block";
  document.querySelector("#reports-btn").style.display = "block";

  showSection(last);
  if (user.role === "MANAGER" || user.role === "RUNNER") {
    document.querySelector("#assign-tasks-btn").style.display = "block";
    document.querySelector("#manage-users-btn").style.display = "block";
  } else {
    document.querySelector("#my-tasks-btn").style.display = "block";
  }
}

//Function to show specific section and hide all others
function showSection(sectionId) {
  sessionStorage.setItem("current-section", JSON.stringify(sectionId));
  let user = JSON.parse(sessionStorage.getItem("user"));
  if (user) {
    const role = user.role;
    if (role === "MANAGER" || user.role === "RUNNER") {
    } else {
    }
  }

  switch (sectionId) {
    case "mytasks":
      console.log("in my tasks");
      getMyTasks();
      break;
    case "dashboard":
      getDashboard();
      break;
    case "reports":
      console.log("in my tasks");
      getMetricsReport();
      break;
    default:
      break;
  }

  // Array of all section IDs
  const sections = [
    "login",
    "assigntasks",
    "dashboard",
    "mytasks",
    "reports",
    "manageusers",
  ];

  // Hide all sections first
  sections.forEach(function (id) {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = "block";
  }

  window.scrollTo({
    top: 20,
    behavior: "smooth",
  });
}

// Handle login form submission
function handleLogin(btn) {
  const email = document.getElementById("username").value; //email not username
  const password = document.getElementById("password").value;

  if (!email) {
    document.getElementById("username_error").style.display = "flex";
  }
  if (!password) {
    document.getElementById("password_error").style.display = "flex";
  }

  console.log("email == ", email);
  console.log("Password == ", password);

  console.log("About to send to the");
  btn.innerHTML = `<span><i class="fas fa-spinner fa-spin"></i>Signing in...</span>`;

  if (password && email) {
    fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }), // Send login data to backend
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          let userData = data.user;
          user = userData;
          sessionStorage.setItem("user", JSON.stringify(userData));

          //show user info
          infoCard.style.dislay = "flex";
          //hide login menu items and sections
          document.querySelector("#logout-btn").style.display = "block";
          document.querySelector("#dashboard-btn").style.display = "block";
          document.querySelector("#reports-btn").style.display = "block";

          //hide buttons and sections
          document.querySelector("#login-btn").style.display = "none";
          document.querySelector("#faqs-btn").style.display = "none";
          document.querySelector("#about-btn").style.display = "none";
          document.querySelector("#ai-btn").style.display = "none";
          document.querySelector("#about").style.display = "none";
          document.querySelector("#howitworks").style.display = "none";
          document.querySelector("#ai-usage").style.display = "none";
          document.querySelector("#faqs").style.display = "none";
          document.querySelector("#how-it-works-btn").style.display = "none";

          //navigate to dashboard
          showSection("dashboard");

          console.log(userData.role);
          if (userData.role === "MANAGER" || userData.role === "RUNNER") {
            document.querySelector("#manage-users-btn").style.display = "block";
            document.querySelector("#assign-tasks-btn").style.display = "block";
          } else {
            document.querySelector("#my-tasks-btn").style.display = "block";
          }
          // Redirect or load dashboard here
        } else {
          document.getElementById("login-error").textContent = data.message;
          btn.innerHTML = `<span>Sign in</span>`;
          console.log(data.message);
        }

        setTimeout(() => {
          btn.innerHTML = "Sign In";
        }, 3000);
      })
      .catch((error) => console.error("Login error:", error));
  }
}

/**/
let workers = [];
function loadWorkersByRole() {
  const role = document.getElementById("role-select").value;
  const workerSelect = document.getElementById("worker-select");
  const workerError = document.getElementById("worker_error");

  workerError.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Fetching available Personelle(' +
    role +
    ")";

  fetch(`http://localhost:3000/api/auth/workers?role=${role}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        workers = data.workers;

        workerError.innerHTML =
          workers.length > 0
            ? "✅Successfully fetched " + workers.length + " personelles"
            : "✅Successfull but no available personelles";

        console.log(workers);
        // Clear old options
        workerSelect.innerHTML =
          '<option value="">-- Select a Worker --</option>';

        workers.forEach((worker) => {
          const option = document.createElement("option");
          option.value = worker.persal_number;
          option.textContent = worker.surname_initials;
          workerSelect.appendChild(option);
        });
      } else {
        workerError.innerHTML = " ❌ Failed to fetch personnell.";
      }
    })
    .catch((error) => {
      console.error("Error fetching personnell.", error);
      workerError.innerHTML = "❌ Server error while fetching personnell.";
    });
}

function assignTask() {
  const batch = document.getElementById("batch-number").value.trim();
  const role = document.getElementById("role-select").value;
  const workerPersal = document.getElementById("worker-select").value; //persal number

  if (!batch) {
    document.getElementById("batch_error").textContent =
      "  Batch number is required";
  }
  if (!role) {
    document.getElementById("role_error").textContent = "  Role is required";
  }
  if (!workerPersal) {
    document.getElementById("worker_error").textContent =
      "  Personell is required";
  }

  const workerName =
    workers.find((w) => w.persal_number === workerPersal)?.surname_initials ||
    null;

  // Build the payload
  const taskData = {
    batchNumber: batch,
    persalNumber: workerPersal,
    role: role,
    assignedTo: workerName,
  };

  console.log(taskData);

  // Send the fetch POST request to the /task endpoint
  fetch("http://localhost:3000/api/tasks/assign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("assign-error").textContent =
          "✅ Task assigned successfully!";
        console.log("Task assigned:", data);
      } else {
        //document.getElementById("assign-error").textContent =
        console.log("❌ Failed to assign task.");
      }
    })
    .catch((error) => {
      console.error("Error assigning task:", error);
      document.getElementById("assign-error").textContent =
        "❌ Server error while assigning task.";
    });
}

// Add enter key functionality to login form
document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleLogin();
      }
    });
  }
});

function logout() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("current-section");

  infoCard.style.dislay = "none";

  document.querySelector("#logout-btn").style.display = "none";
  document.querySelector("#my-tasks-btn").style.display = "none";
  document.querySelector("#assign-tasks-btn").style.display = "none";
  document.querySelector("#dashboard-btn").style.display = "none";
  document.querySelector("#reports-btn").style.display = "none";
  document.querySelector("#manage-users-btn").style.display = "none";

  document.querySelector("#faqs-btn").style.display = "block";
  document.querySelector("#about-btn").style.display = "block";
  document.querySelector("#how-it-works-btn").style.display = "block";
  document.querySelector("#ai-btn").style.display = "block";
  document.querySelector("#about").style.display = "block";
  document.querySelector("#howitworks").style.display = "block";
  document.querySelector("#ai-usage").style.display = "block";
  document.querySelector("#faqs").style.display = "block";

  document.querySelector("#login-btn").style.display = "block";
  showSection("login");
}

function scrollToSection(id) {
  console.log("we are here==", id);
  const target = document.getElementById(id);
  const offset = 15;
  const topPos = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: topPos,
    behavior: "smooth",
  });
}

//get tasks
function getMyTasks() {
  console.log("get my tasks", user);
  let id = user.persalNumber;
  let role = user.role;

  console.log("starting ", id, role);

  let tasksLoader = document.querySelector(".tasks-load");
  tasksLoader.innerHTML = `
    <div class="loading-tasks" style="text-align:center; color:white;">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading Tasks...</p>
    </div>
  `;

  fetch(`http://localhost:3000/api/tasks/?id=${id}&role=${role}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Raw data from API:", data);
      if (data.success) {
        let tasks = data.tasks;
        // Initialize with sample data
        setTimeout(() => {
          tasksLoader.innerHTML = "";
          renderTaskList(tasks);
        }, 2000);

        // Display tasks in UI here
      } else {
        console.log("❌ Failed to fetch tasks.");
      }
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
    });
}

// get dashboards
function getDashboard() {
  let id = user.persalNumber;
  let role = user.role;

  let dashboardLoader = document.querySelector(".section-load");
  dashboardLoader.innerHTML = `
    <div class="loading-tasks" style="text-align:center; color:white;">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading Dashboard...</p>
    </div>
  `;

  fetch(`http://localhost:3000/api/dashboard/?id=${id}&role=${role}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Raw data from API:", data);
      if (data.success) {
        console.log(data);

        setTimeout(() => {
          dashboardLoader.innerHTML = ""; // clear loading spinner
          renderDashboardData(data); // your custom rendering function
        }, 1000);
      } else {
        dashboardContainer.innerHTML = `
          <p style="text-align:center; color:red;">❌ Failed to fetch dashboard.</p>
        `;
      }
    })
    .catch((error) => {
      console.error("Error fetching dashboard:", error);
      dashboardContainer.innerHTML = `
        <p style="text-align:center; color:red;">⚠️ Error loading dashboard.</p>
      `;
    });
}

//Render dashboard
function renderDashboardData(data) {
  let stats;

  // Pick correct dashboard object
  if (user.role === "MANAGER" || user.role === "RUNNER") {
    stats = data.managerDashboard;
  } else {
    stats = data.workerDashboard;
  }

  // Common stats
  document.querySelector("#total-tasks").textContent = stats.totalTasks || 0;
  document.querySelector("#completed-tasks").textContent =
    stats.completedTasks || 0;
  document.querySelector("#pending-tasks").textContent =
    stats.pendingTasks || 0;

  // Manager-only fields
  if (user.role === "MANAGER" || user.role === "RUNNER") {
    document
      .querySelectorAll(".manager-only")
      .forEach((el) => (el.style.display = "block"));
    document
      .querySelectorAll(".worker-only")
      .forEach((el) => (el.style.display = "none"));

    document.querySelector("#active-members").textContent =
      stats.activeMembers || 0;
    document.querySelector("#all-avg-time").textContent =
      stats.avgCompletionTime || 0;
  }
  // Worker-only fields
  else {
    document
      .querySelectorAll(".worker-only")
      .forEach((el) => (el.style.display = "block"));
    document
      .querySelectorAll(".manager-only")
      .forEach((el) => (el.style.display = "none"));

    document.querySelector("#total-reports").textContent =
      stats.totalReports || 0;
    document.querySelector("#efficiency-score").textContent =
      (stats.efficiencyScore || 0) + "%";
    document.querySelector("#avg-time").textContent =
      stats.avgCompletionTime || "0m";
  }

  console.log("Logging stats var", stats);
  // Report summary chart
  if (stats.reportsSummary) {
    const ctx = document.getElementById("reportChart").getContext("2d");

    if (window.reportChart instanceof Chart) {
      window.reportChart.destroy();
    }

    window.reportChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Errors", "Suggestions", "Other"],
        datasets: [
          {
            data: [
              stats.reportsSummary.errors || 0,
              stats.reportsSummary.suggestions || 0,
              stats.reportsSummary.other || 0,
            ],
            backgroundColor: ["#e74c3c", "#f1c40f", "#3498db"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }
}

//format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "status-pending";
    case "IN_PROGRESS":
    case "IN-PROGRESS":
      return "status-in-progress";
    case "COMPLETED":
      return "status-completed";
    case "ERROR":
      return "status-error";
    default:
      return "status-pending";
  }
}

function handleAction(action, taskId) {
  console.log(`${action} action triggered for task: ${taskId}`);
  alert(`${action} action triggered for task: ${taskId}`);
  // Add your action handling logic here
}

function renderTaskList(tasks) {
  const taskListContainer = document.querySelector(".task-list");

  if (!tasks || tasks.length === 0) {
    taskListContainer.innerHTML =
      '<p style="text-align: center; color: white;">No tasks found.</p>';
    return;
  }

  const renderButtons = (task) => {
    switch (task.status) {
      case "PENDING":
        return `
          <button class="action-btn btn-start" 
            onclick="showPopup('Start Task', 'Are you sure you want to start this task?', '${task.id}', 'start')">
            Start Task
          </button>
         <!-- Trigger Button Example -->
<button class="action-btn btn-error" onclick="openReportPopup('${task.id}')">
  Report
</button>
        `;
      case "IN_PROGRESS":
        return `
          <button class="action-btn btn-end" 
            onclick="showPopup('End Task', 'Do you want to end this task?', '${task.id}', 'end')">
            End Task
          </button>
          <!-- Trigger Button Example -->
<button class="action-btn btn-error" onclick="openReportPopup('${task.id}')">
  Report
</button>
        `;
      case "COMPLETED":
        return `
            <!-- Trigger Button Example -->
<button class="action-btn btn-error" onclick="openReportPopup('${task.id}')">
  Report
</button>
        `;
      default:
        return `
          <!-- Trigger Button Example -->
<button class="action-btn btn-error" onclick="openReportPopup('${task.id}')">
  Report Error
</button>
        `;
    }
  };

  const taskCards = tasks
    .map((task) => {
      // Only add elapsed-time span if in-progress
      const elapsedTimeHtml =
        task.status === "IN_PROGRESS" && task.start_time
          ? `<div class="detail-row">
              <span class="detail-label">Elapsed Time:</span>
              <span class="detail-value elapsed-time" data-start="${task.start_time}" id="elapsed-${task.id}">
                Calculating...
              </span>
            </div>`
          : "";

      return `
      <div class="task-card">
        <div class="task-header">
          <div>
            <span class="batch-number">Batch: ${task.batch_number}</span>
            <span class="status-badge ${getStatusClass(task.status)}">
              ${task.status || "Unknown"}
            </span>
          </div>
        </div>

        <div class="task-details">
          ${
            task.date
              ? `<div class="detail-row"><span class="detail-label">Date:</span> <span class="detail-value">${formatDate(
                  task.date
                )}</span></div>`
              : ""
          }
          ${
            task.start_time
              ? `<div class="detail-row"><span class="detail-label">Start Time:</span> <span class="detail-value">${formatDate(
                  task.start_time
                )}</span></div>`
              : ""
          }
          ${
            task.finish_time
              ? `<div class="detail-row"><span class="detail-label">End Time:</span> <span class="detail-value">${task.finish_time}</span></div>`
              : ""
          }
          ${
            task.assignedTo
              ? `<div class="detail-row"><span class="detail-label">Assigned To:</span> <span class="detail-value">${task.assignedTo}</span></div>`
              : ""
          }
          ${elapsedTimeHtml}
        </div>

        <div class="task-actions">
          ${renderButtons(task)}
        </div>
      </div>
      `;
    })
    .join("");

  taskListContainer.innerHTML = taskCards;

  // Start live elapsed time updates
  const updateElapsedTime = () => {
    document.querySelectorAll(".elapsed-time").forEach((el) => {
      const startTime = new Date(el.dataset.start);
      const now = new Date();
      const diffMs = now - startTime;

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      el.textContent = `${diffHours}h ${diffMins}m ${diffSecs}s`;
    });
  };

  updateElapsedTime();
  setInterval(updateElapsedTime, 1000);
}

// Expose the function globally for external use
window.renderTaskList = renderTaskList;
window.handleAction = handleAction;

//Metrics report
function getMetricsReport() {
  let persal = user.persalNumber;
  let role = user.role;

  fetch(`http://localhost:3000/api/metrics?role=${role}&persal=${persal}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Metrics loaded:", data);

      // --- Tasks Completed ---
      document.getElementById("tasksCompletedCurrent").textContent =
        data.tasksCompleted.current;
      document.getElementById("tasksCompletedPrevious").textContent =
        data.tasksCompleted.previous;
      setChangeColor(
        document.getElementById("tasksCompletedChange"),
        data.tasksCompleted.change
      );

      // --- User Engagement ---
      document.getElementById("userEngagementCurrent").textContent =
        data.userEngagement.current;
      document.getElementById("userEngagementPrevious").textContent =
        data.userEngagement.previous;
      setChangeColor(
        document.getElementById("userEngagementChange"),
        data.userEngagement.change
      );

      // --- Error Rate ---
      document.getElementById("errorRateCurrent").textContent =
        data.errorRate.current;
      document.getElementById("errorRatePrevious").textContent =
        data.errorRate.previous;
      setChangeColor(
        document.getElementById("errorRateChange"),
        data.errorRate.change,
        true // invert colors because lower error rate is good
      );

      loadReports();
    })
    .catch((error) => {
      console.error("Error loading metrics:", error);
    });
}

// helper: add color based on +/-
function setChangeColor(cell, value, invert = false) {
  cell.textContent = value;
  const num = parseFloat(value);
  if (isNaN(num)) return;

  if ((!invert && num >= 0) || (invert && num <= 0)) {
    cell.style.color = "#28a745"; // green
  } else {
    cell.style.color = "#dc3545"; // red
  }
}

//load reports
function loadReports() {
  let reportLoader = document.querySelector(".reports-load");
  reportLoader.innerHTML = `
    <div class="loading-tasks" style="text-align:center; color:white;">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading Reports...</p>
    </div>
  `;

  console.log("About to load reports");

  let persal = user.persalNumber;
  let role = user.role;

  fetch(`http://localhost:3000/api/reports?role=${role}&persal=${persal}`)
    .then((res) => res.json())
    .then((reports) => {
      setTimeout(() => {
        reportLoader.innerHTML = "";
      }, 1000);
      const container = document.getElementById("render-reports");
      container.innerHTML = "";

      if (reports.length === 0) {
        container.innerHTML = "<p>No reports found.</p>";
        return;
      }

      reports.forEach((r) => {
        const div = document.createElement("div");
        div.classList.add("report-card");

        let managerActions = "";
        if (role === "MANAGER" || user.role === "RUNNER") {
          managerActions = `
            <div class="report-actions">
              <button onclick="sendEmail(${r.id})">📧 Send Email</button>
              <button onclick="flagReport(${r.id})">⚠️ Flag</button>
              <button onclick="resolveReport(${r.id})">✅ Resolve</button>
            </div>
          `;
        }

        div.innerHTML = `
          <h4><span class="type">${r.type}</span></h4>
          <p> ${r.role}</p>
          <p>${r.details}</p>
          <small><em>${r.createdAt}</em></small>
          ${managerActions}
        `;
        container.appendChild(div);
      });
    })
    .catch((err) => console.error("Error loading reports:", err));
}

// Example action handlers
function sendEmail(reportId) {
  alert("📧 Sending email for Report #" + reportId);
}
function flagReport(reportId) {
  alert("⚠️ Report #" + reportId + " has been flagged!");
}
function resolveReport(reportId) {
  alert("✅ Report #" + reportId + " marked as resolved.");
}

//get users
function getUsers() {
  fetch("http://localhost:3000/api/auth/users")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    })
    .then((users) => {
      console.log("Logging the users", users);
      renderUsers(users); // Reuse the renderUsers() function
    })
    .catch((err) => {
      console.error("Error loading users:", err);
      document.getElementById("users-list").innerHTML =
        "<p>Failed to load users.</p>";
    });
}

// Call this on page load or when switching to the "View Users" tab

function renderUsers(users) {
  const container = document.getElementById("users-list");
  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = "<p>No users found.</p>";
    return;
  }

  const table = document.createElement("table");
  table.classList.add("users-table");

  // Table header
  table.innerHTML = `
    <thead>
      <tr>
        <th>Persal Number</th>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${users
        .map(
          (u) => `
        <tr class="${u.is_active ? "active-user" : "inactive-user"}">
          <td>${u.persal}</td>
          <td>${u.surname_initials}</td>
          <td>${u.role}</td>
          <td>${u.is_active ? "Available" : "Unavailable"}</td>
          <td>
            <button class="delete-btn" onclick="deleteUser('${u.persal}',this)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

// Example delete function
function deleteUser(persal, btnElement) {
  //if (!confirm("Are you sure you want to delete this user?")) return;

  // Create loading spinner
  const spinner = document.createElement("span");
  spinner.classList.add("loading-spinner");
  spinner.style.marginLeft = "5px";
  spinner.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
  btnElement.parentNode.appendChild(spinner);

  // Send delete request to server
  fetch(`http://localhost:3000/api/auth/users/${persal}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        setTimeout(() => {
          // Remove the user's row from table
          const row = btnElement.closest("tr");
          row.remove();
        }, 60000);
      } else {
        alert("Error: " + (data.error || "Could not delete user"));
      }
    })
    .catch((err) => {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Check console for details.");
    })
    .finally(() => {
      // Remove spinner
      spinner.remove();
    });
}

function openChatbot() {
  // Opens chatbot.html in a new small popup window
  window.open(
    "/chatbot.html",
    "Chatbot",
    "width=400,height=600,left=100,top=100,resizable=yes,scrollbars=yes"
  );
}

function showPopup(title, message, id, act) {
  let titleEl = document.getElementById("popup-title");
  let messageEl = document.getElementById("popup-message");

  titleEl.textContent = title;
  messageEl.textContent = message;

  const popup = document.getElementById("taskPopup");

  popup.style.display = "flex";

  // Confirm button
  document.getElementById("popup-confirm").onclick = () => {
    // popup.style.display = "none";
    if (act === "start") {
      showLoading(messageEl, "Starting");
      startTask(id);
    } else if (act === "end") {
      showLoading(messageEl, "Ending");
      endTask(id);
    }
  };

  // Cancel button
  document.getElementById("popup-cancel").onclick = () => {
    popup.style.display = "none";
  };
}

function showLoading(titleEl, action) {
  titleEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${action} task...`;
}

//User begins thier task
function startTask(id) {
  console.log("Starting this task", id);
  const popup = document.getElementById("taskPopup");
  let messageEl = document.getElementById("popup-message");

  fetch(`http://localhost:3000/api/tasks/${id}/start`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "IN_PROGRESS",
      persalNumber: user.persalNumber,
    }), // you can set status however you like
  })
    .then((res) => {
      if (!res.ok) {
        messageEl.innerHTML = "An error occured, try again!!";
        throw new Error("Failed to start task");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Task started:", data);
      if (data.success) {
        getMyTasks();
      } else {
        messageEl.innerHTML = "An error occured, try again!!";
      }

      setTimeout(() => {
        popup.style.display = "none";
      }, 1000);
    })
    .catch((err) => console.error("Error:", err));
}

//User end thier task
function endTask(id) {
  console.log("Ending this task", id);
  const popup = document.getElementById("taskPopup");
  let messageEl = document.getElementById("popup-message");

  fetch(`http://localhost:3000/api/tasks/${id}/end`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "COMPLETED",
      persalNumber: user.persalNumber,
    }), // you can set status however you like
  })
    .then((res) => {
      if (!res.ok) {
        messageEl.innerHTML = "An error occured, try again!!";
        throw new Error("Failed to end task");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Task ended:", data);
      if (data.success) {
        getMyTasks();
      } else {
        messageEl.innerHTML = "An error occured, try again!!";
      }

      setTimeout(() => {
        popup.style.display = "none";
      }, 3000);
    })
    .catch((err) => console.error("Error:", err));
}

let id = null;

function openReportPopup(taskId) {
  id = taskId;
  document.getElementById("reportPopup").style.display = "flex";
}

function closeReportPopup() {
  document.getElementById("reportPopup").style.display = "none";
  document.getElementById("reportMessage").value = "";
}

function submitReport() {
  const type = document.getElementById("reportType").value;
  const message = document.getElementById("reportMessage").value;

  const messageEl = document.getElementById("report-task-alert");
  if (message.trim() === "") {
    alert("Please enter a comment before submitting.");
    return;
  }

  messageEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i>Reporting Task`;

  // Send data to backend
  fetch(`http://localhost:3000/api/reports/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: type,
      message: message,
      role: user.role,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      setTimeout(() => {
        if (data.success) {
          messageEl.innerHTML = "Report submitted";
        } else {
          messageEl.innerHTML = "Report not submitted";
        }
        closeReportPopup();
      }, 2000);
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Failed to connect to server.");
    });
}

//=================USED TO ADD USERS=======================

function addUser() {
  const persalNumber = document.getElementById("persal-number").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const email = document.getElementById("emails").value.trim();
  const role = document.getElementById("role-add").value;

  // Simple validation
  if (!persalNumber || !surname || !email || !role) {
    alert("⚠️ Please fill in all fields before submitting.");
    return;
  }

  const payload = {
    persal_number: persalNumber,
    surname: surname,
    role: role,
    email: email,
  };

  console.log("Here we go", payload);

  // Loading state
  const btn = document.querySelector(".add-user-btn");
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Adding...`;

  fetch("http://localhost:3000/api/auth/addUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Just fetched data", data);
      if (data.success) {
        alert("✅ User added successfully!");
        document.getElementById("persal-number").value = "";
        document.getElementById("surname").value = "";
        document.getElementById("role-add").value = "";
        document.getElementById("emails").value = "";

        // Example usage
        alert("Your account has been created successfully");
        /*sendDocuTrackerEmail(
    " New User 🎉",
    "Your account has been created successfully.  Your password is "+data.generatedPasword
  );*/
        //generatePassword(email,persalNumber);
      } else {
        alert("❌ Failed to add user: " + (data.error || "Unknown error"));
      }
    })
    .catch((err) => {
      console.error("Error adding user:", err);
      alert("❌ Could not connect to server.");
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = `Add User`;
    });
}

//TABS HANDLER
function openTab(evt, tabId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => (content.style.display = "none"));

  // Remove active class from all buttons
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => btn.classList.remove("active"));

  // Show selected tab
  document.getElementById(tabId).style.display = "block";
  evt.currentTarget.classList.add("active");

  if (tabId === "view-users-tab") {
    getUsers();
  }
}
