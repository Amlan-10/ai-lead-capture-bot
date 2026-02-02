async function sendMessage() {
  const input = document.getElementById("user-input");
  const userText = input.value.trim();

  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";
  showTyping();

  try {
    const response = await fetch("https://ai-lead-capture-bot.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userText, botType: "lead" })

    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    removeTyping();

    if (data.reply) {
      addMessage(data.reply, "bot");
    } else {
      addMessage("Sorry, something went wrong.", "bot");
    }

  } catch (error) {
    console.error("Error:", error);
    removeTyping();
    addMessage("Error connecting to AI service.", "bot");
  }
}

function addMessage(text, sender) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const chatBox = document.getElementById("chat-box");
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.id = "typing";
  typing.innerText = "Typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// Allow Enter key to send message
document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
