
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

async function sendDiscordMessage() {
  if (!webhookUrl) {
    throw new Error("Missing DISCORD_WEBHOOK_URL");
  }

  const message = {
    username: "Albion Daily Bonus",
    embeds: [
      {
        title: "⚔️ ALBION ONLINE - DAILY PRODUCTION BONUS",
        description: "✅ Discord Webhook hoạt động thành công!",
        color: 15844367,
        fields: [
          {
            name: "🌏 Server",
            value: "Asia",
            inline: true
          },
          {
            name: "⏰ Thời gian dự kiến",
            value: "06:30 AM (GMT+7)",
            inline: true
          },
          {
            name: "📢 Trạng thái",
            value: "Đây là thông báo TEST từ GitHub Actions."
          }
        ],
        footer: {
          text: "Albion Daily Bonus Bot"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    throw new Error(
      `Discord API Error: ${response.status} ${await response.text()}`
    );
  }

  console.log("Discord notification sent successfully!");
}

sendDiscordMessage().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
