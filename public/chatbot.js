// Check if user exists in session
const user = sessionStorage.getItem("user")
  ? JSON.parse(sessionStorage.getItem("user"))
  : null;

sessionStorage.removeItem("history");
console.log(user);

let questions = [];
let answers = [];
let messageCount = 0;

if (!user) {
  // Generic questions before login
  questions = [
    "What is the Document Processing Hub?",
    "How does document digitization work?",
    "Why is digitization important for DHA?",
    "What roles exist in the hub?",
    "How are documents delivered to the hub?",
    "What steps are followed from delivery to digitization?",
    "Who ensures quality of scanned documents?",
    "How do managers use analytics in the hub?",
    "What technologies are used in document digitization?",
    "What happens to physical documents after scanning?",
  ];

  answers = [
    "The Document Processing Hub is a central facility where physical DHA documents are securely received, processed, and digitized into electronic formats for easier storage and retrieval.",
    "Document digitization works by scanning physical files, indexing key information, and storing them in digital repositories accessible for secure use and management.",
    "Digitization is important for DHA because it improves efficiency, reduces paper handling risks, enhances accessibility, and ensures long-term preservation of government records.",
    "Roles in the hub include Drivers, Receivers, Indexers, Scanners, Quality Controllers, Batch Creators, Admins, and Managers overseeing operations.",
    "Documents are delivered by trained drivers who transport them securely from DHA offices to the digitization hub.",
    "Steps include document delivery, receiving, indexing, scanning, quality control, and secure storage of the digital files.",
    "Quality Controllers (QC) ensure scanned documents meet accuracy, clarity, and completeness standards before final storage.",
    "Managers use analytics to track productivity, monitor workflows, identify bottlenecks, and make data-driven operational decisions.",
    "Technologies used include high-speed scanners, indexing software, databases, workflow management systems, and secure cloud storage solutions.",
    "After scanning, physical documents are securely stored in archives or returned to DHA for safekeeping as per policy.",
  ];
} else {
  // Manager-specific questions
  if (user.role === "MANAGER") {
    questions = [
      "What is my role as a Manager?",
      "How can I view analytics?",
      "How do I monitor document deliveries?",
      "What insights can I get about staff performance?",
      "How do I oversee digitization progress?",
      "How do I handle escalations or errors in processing?",
      "What KPIs should I track daily?",
      "How do I assign tasks to Admin staff?",
      "How can I check backlog or pending batches?",
      "What reports are available to me?",
    ];
  } else {
    // Staff/Driver/Receiver/Admin (general operations)
    questions = [
      "What is my role as an " + user.role + "?",
      "How do I log incoming documents?",
      "What steps are involved in processing a batch?",
      "How do I escalate issues to my manager?",
      "What should I do if a document is damaged?",
      "How do I check the status of a delivery?",
      "What are the quality control steps?",
      "How do I mark documents as completed?",
      "What should I do if I make a mistake?",
      "Who do I contact for technical support?",
    ];
  }
}

if (!user) {
  console.log("Not logged in");
  renderDefaultQuestions(questions);
}

function clearEmptyState() {
  const emptyChat = document.querySelector(".empty-chat");
  if (emptyChat) {
    emptyChat.remove();
  }
}

function hideDefaultQuestions() {
  const defaultSection = document.getElementById("default-questions-section");
  if (defaultSection && messageCount > 0) {
    defaultSection.style.display = "none";
  }
}

function addMessage(content, isUser = false) {
  const chatbox = document.getElementById("chatbox");
  clearEmptyState();

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = `message-avatar ${
    isUser ? "user-avatar" : "bot-avatar-small"
  }`;
  avatar.innerHTML = isUser
    ? '<i class="fas fa-user"></i>'
    : '<i class="fas fa-robot"></i>';

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isUser ? "user-bubble" : "bot-bubble"}`;
  bubble.innerHTML = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatbox.appendChild(messageDiv);

  chatbox.scrollTop = chatbox.scrollHeight;
  messageCount++;
  hideDefaultQuestions();
}

function addThinkingIndicator() {
  const chatbox = document.getElementById("chatbox");
  clearEmptyState();

  const thinkingDiv = document.createElement("div");
  thinkingDiv.className = "thinking-indicator";
  thinkingDiv.id = "thinking-indicator";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar bot-avatar-small";
  avatar.innerHTML = '<i class="fas fa-robot"></i>';

  const bubble = document.createElement("div");
  bubble.className = "thinking-bubble";
  bubble.innerHTML = `
          <span>Thinking</span>
          <div class="thinking-dots">
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
          </div>
        `;

  thinkingDiv.appendChild(avatar);
  thinkingDiv.appendChild(bubble);
  chatbox.appendChild(thinkingDiv);

  chatbox.scrollTop = chatbox.scrollHeight;
}

function removeThinkingIndicator() {
  const thinking = document.getElementById("thinking-indicator");
  if (thinking) {
    thinking.remove();
  }
}

async function sendMessage() {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();
  const sendButton = document.getElementById("sendButton");

  if (!message) return;
  let history = JSON.parse(sessionStorage.getItem("history")) || [];
   history.push({ "User": message });

  // Disable input while processing
  messageInput.disabled = true;
  sendButton.disabled = true;

  // Add user message
  addMessage(message, true);
  messageInput.value = "";

  // Add thinking indicator
  addThinkingIndicator();

  try {
    console.log("request sent!!");
    const res = await fetch("http://localhost:3000/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message,history}),
    });
    const data = await res.json();
    console.log("logging data", data);

    history.push({ AIReply: data.reply });
    sessionStorage.setItem("history", JSON.stringify(history));
    // Simulate delay for better UX
    setTimeout(() => {
      removeThinkingIndicator();
      addMessage(data.reply);

      // Re-enable input
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
    }, 1500);
  } catch (error) {
    console.error("Error:", error);
    setTimeout(() => {
      removeThinkingIndicator();
      addMessage(
        "Sorry, I'm having trouble connecting right now. Please try again later."
      );

      // Re-enable input
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
    }, 1500);
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function renderDefaultQuestions(questions) {
  const questionsContainer = document.getElementById("default-questions");

  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "default-question";
    questionDiv.setAttribute("data-index", index);

    questionDiv.innerHTML = `
            <span class='question-text'>${question}</span>
            <i class='fas fa-times cancel-question'></i>
          `;

    questionsContainer.appendChild(questionDiv);
  });
}

// Handle clicks on default questions
document.addEventListener("click", (ev) => {
  const questionEl = ev.target.closest(".default-question");
  if (!questionEl) return;

  if (ev.target.classList.contains("cancel-question")) {
    // Remove the question with animation
    questionEl.style.transform = "scale(0)";
    questionEl.style.opacity = "0";
    setTimeout(() => questionEl.remove(), 200);
  } else {
    const index = parseInt(questionEl.getAttribute("data-index"));
    const questionText = questionEl.querySelector(".question-text").textContent;
    const answer = answers[index];

    // Add user message
    addMessage(questionText, true);

    // Add thinking indicator
    addThinkingIndicator();

    // Simulate bot response
    setTimeout(() => {
      removeThinkingIndicator();
      addMessage(answer);
    }, 2000);
  }
});

// Focus input on load
document.getElementById("message").focus();
