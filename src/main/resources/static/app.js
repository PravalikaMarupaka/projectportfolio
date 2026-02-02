// Charts
new Chart(document.getElementById("diversificationChart"), {
  type: "pie",
  data: {
    labels: ["Equity", "Bonds", "Gold", "Crypto"],
    datasets: [{ data: [55, 20, 15, 10] }]
  }
});

new Chart(document.getElementById("performanceChart"), {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{
      label: "Portfolio Value (L)",
      data: [7.2, 7.5, 7.9, 8.2, 8.5],
      borderColor: "#6366f1",
      tension: 0.4
    }]
  }
});

// Chatbot
function toggleChat() {
  const bot = document.getElementById("chatbot");
  bot.style.display = bot.style.display === "block" ? "none" : "block";
}

function sendMessage(e) {
  if (e.key === "Enter") {
    const input = e.target.value;
    const chat = document.getElementById("chatBody");

    chat.innerHTML += `<p><b>You:</b> ${input}</p>`;

    let reply = "Diversification helps reduce portfolio risk.";
    if (input.toLowerCase().includes("risk"))
      reply = "Your portfolio risk is high due to equity concentration.";
    if (input.toLowerCase().includes("trend"))
      reply = "Current market trends suggest safer allocation in gold.";

    chat.innerHTML += `<p><b>Bot:</b> ${reply}</p>`;
    e.target.value = "";
  }
}
