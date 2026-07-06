// =============================
// Selected Mentor
// =============================

let currentMentor = "hitesh";

// =============================
// DOM Elements
// =============================

const mentors = document.querySelectorAll(".mentor");
const mentorName = document.getElementById("mentor-name");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const chatBox = document.getElementById("chat-box");

// =============================
// Mentor Switching
// =============================

mentors.forEach((mentor) => {

    mentor.addEventListener("click", () => {

        mentors.forEach((m) => m.classList.remove("active"));

        mentor.classList.add("active");

        currentMentor = mentor.dataset.mentor;

        if (currentMentor === "hitesh") {
            mentorName.innerHTML = "👨‍🏫 Hitesh Sir";
        } else {
            mentorName.innerHTML = "🚀 Piyush Sir";
        }

    });

});

// =============================
// Add Message
// =============================

function addMessage(text, sender) {

    const div = document.createElement("div");

    div.className = sender === "user"
        ? "user-message"
        : "bot-message";

    div.innerHTML = text;

    chatBox.appendChild(div);

    scrollBottom();

}

// =============================
// Typing Animation
// =============================

function showTyping() {

    const div = document.createElement("div");

    div.className = "bot-message";

    div.id = "typing";

    div.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
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
// Send Message
// =============================

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    addMessage(text, "user");

    messageInput.value = "";

    showTyping();

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                mentor: currentMentor,

                message: text

            })

        });

        const data = await response.json();

        hideTyping();

        addMessage(data.reply, "bot");

    } catch (error) {

        hideTyping();

        addMessage(
            "❌ Server Error. Please try again.",
            "bot"
        );

        console.error(error);

    }

}

// =============================
// Button
// =============================

sendBtn.addEventListener("click", sendMessage);

// =============================
// Enter Key
// =============================

messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});