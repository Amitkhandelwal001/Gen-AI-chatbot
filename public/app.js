// =============================
// State Management
// =============================

let currentMentor = "hitesh";

const chatHistories = {
    hitesh: [
        {
            text: "👋 Haan ji, welcome! Hitesh Sir here. Backend, DevOps ya system architecture ke baare mein kuch poochna hai?",
            sender: "bot"
        }
    ],
    piyush: [
        {
            text: "🚀 Hello! Piyush Sir here. AI, LLMs, ya Next-Gen system design discuss karna hai toh batao. Let's build something great!",
            sender: "bot"
        }
    ]
};

// =============================
// DOM Elements
// =============================

const mentors = document.querySelectorAll(".mentor");
const mentorName = document.getElementById("mentor-name");
const headerAvatar = document.getElementById("header-avatar");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const chatBox = document.getElementById("chat-box");

// =============================
// Initialize
// =============================

function renderChat() {
    chatBox.innerHTML = "";
    const history = chatHistories[currentMentor];
    
    history.forEach(msg => {
        const div = document.createElement("div");
        div.className = `message-wrapper ${msg.sender}`;
        
        div.innerHTML = `
            <div class="message-bubble">
                ${msg.text}
            </div>
        `;
        chatBox.appendChild(div);
    });
    scrollBottom();
}

// Initial render
renderChat();

// =============================
// Mentor Switching
// =============================

mentors.forEach((mentor) => {
    mentor.addEventListener("click", () => {
        if (currentMentor === mentor.dataset.mentor) return; // Ignore if already selected

        mentors.forEach((m) => m.classList.remove("active"));
        mentor.classList.add("active");

        currentMentor = mentor.dataset.mentor;

        // Update Header
        if (currentMentor === "hitesh") {
            mentorName.innerHTML = "Hitesh Sir";
            headerAvatar.innerHTML = '<img src="hitesh.jpg" alt="Hitesh Sir" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">';
            headerAvatar.className = "header-avatar hitesh-bg";
        } else {
            mentorName.innerHTML = "Piyush Sir";
            headerAvatar.innerHTML = '<img src="piyush.jpg" alt="Piyush Sir" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">';
            headerAvatar.className = "header-avatar piyush-bg";
        }

        // Render the newly selected mentor's chat history
        renderChat();
    });
});

// =============================
// Add Message
// =============================

function addMessage(text, sender) {
    // Save to state
    chatHistories[currentMentor].push({ text, sender });
    
    // Render immediately if we are on the current mentor's view
    const div = document.createElement("div");
    div.className = `message-wrapper ${sender}`;
    
    div.innerHTML = `
        <div class="message-bubble">
            ${text}
        </div>
    `;
    chatBox.appendChild(div);
    scrollBottom();
}

// =============================
// Typing Animation
// =============================

function showTyping() {
    const div = document.createElement("div");
    div.className = "message-wrapper bot";
    div.id = "typing";
    
    div.innerHTML = `
        <div class="message-bubble">
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatBox.appendChild(div);
    scrollBottom();
}

function hideTyping() {
    const typing = document.getElementById("typing");
    if (typing) {
        typing.remove();
    }
}

// =============================
// Scroll
// =============================

function scrollBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// =============================
// Auto-resize Textarea
// =============================

messageInput.addEventListener("input", function() {
    this.style.height = "48px"; // Reset
    this.style.height = (this.scrollHeight) + "px"; // Set to content height
});

// =============================
// Send Message
// =============================

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    
    // Reset input
    messageInput.value = "";
    messageInput.style.height = "48px";
    
    showTyping();

    // Store the mentor context for this request
    // Just in case user switches mentor while request is pending
    const mentorAtRequestTime = currentMentor;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mentor: mentorAtRequestTime,
                message: text
            })
        });

        const data = await response.json();
        
        // If user hasn't switched mentors, hide typing
        if (currentMentor === mentorAtRequestTime) {
            hideTyping();
        }

        // Add message to state (and DOM if currently viewing this mentor)
        chatHistories[mentorAtRequestTime].push({ text: data.reply, sender: "bot" });
        
        if (currentMentor === mentorAtRequestTime) {
            // It's the active tab, render it
            const div = document.createElement("div");
            div.className = `message-wrapper bot`;
            div.innerHTML = `
                <div class="message-bubble">
                    ${data.reply}
                </div>
            `;
            chatBox.appendChild(div);
            scrollBottom();
        }

    } catch (error) {
        if (currentMentor === mentorAtRequestTime) hideTyping();
        
        const errorMsg = "❌ Server Error. Please try again.";
        chatHistories[mentorAtRequestTime].push({ text: errorMsg, sender: "bot" });
        
        if (currentMentor === mentorAtRequestTime) {
            const div = document.createElement("div");
            div.className = `message-wrapper bot`;
            div.innerHTML = `<div class="message-bubble">${errorMsg}</div>`;
            chatBox.appendChild(div);
            scrollBottom();
        }
        console.error(error);
    }
}

// =============================
// Event Listeners
// =============================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});