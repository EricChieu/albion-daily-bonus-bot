
const API_URL =
  "https://api.albionfreemarket.com/be/dataclient/festivities/current";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

const BONUS_NAMES = {
  FOOD: "Food",
  POTION: "Potion",
  ORE: "Ore",
  TOOLS: "Tools",
  BAG: "Bag",
  OFFHAND: "Off-hand"
};

async function main() {
  if (!webhookUrl) {
    throw new Error("Missing DISCORD_WEBHOOK_URL");
  }

  // 1. Lấy dữ liệu thực tế
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Albion API error: ${response.status}`);
  }

  const data = await response.json();

  // 2. Chọn server Asia
  const asia = data.servers?.find(
    server => server.serverId === 1
  );

  if (!asia) {
    throw new Error("Không tìm thấy server Asia");
  }

  // 3. Lọc Daily Production Bonus còn hiệu lực
  const now = Date.now();

  const bonuses = asia.events.filter(event =>
    event.kind === 2 &&
    event.category === "GENERAL" &&
    Date.parse(event.startTime) <= now &&
    now < Date.parse(event.endTime)
  );

  if (bonuses.length === 0) {
    console.log("Chưa có Daily Bonus hợp lệ. Không gửi.");
    return;
  }

  // 4. Chuyển mã bonus thành tên dễ đọc
  const fields = bonuses.map(event => {
    const match = event.uniqueName.match(
      /^(COMMON|RARE)_(.+)$/
    );

    if (!match) {
      throw new Error(
        `Unknown bonus code: ${event.uniqueName}`
      );
    }

    const [, tier, code] = match;
    const name = BONUS_NAMES[code] ||
      code.replaceAll("_", " ");

    return {
      name: `⚒️ ${name}`,
      value: tier === "RARE" ? "+20%" : "+10%",
      inline: true
    };
  });

  // 5. Gửi Discord
  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "Albion Daily Bonus",
      embeds: [{
        title: "⚔️ DAILY PRODUCTION BONUS — ASIA",
        description: "Bonus sản xuất đang có hiệu lực",
        color: 15844367,
        fields,
        footer: {
          text: "Source: Albion Free Market"
        },
        timestamp: new Date().toISOString()
      }]
    })
  });

  if (!discordResponse.ok) {
    throw new Error(
      `Discord error: ${discordResponse.status}`
    );
  }

  console.log("Đã gửi Daily Production Bonus!");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
