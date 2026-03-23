import { prisma } from "./lib/prisma.ts";
import { config } from "./lib/config.ts";

async function main() {
  const a = await prisma.alert.findFirst({
    where: { imageUrl: { contains: "i.redd.it" } },
    select: { imageUrl: true, title: true },
  });
  if (!a || !a.imageUrl) { console.log("No i.redd.it alert found"); await prisma.$disconnect(); return; }
  console.log("Sending big image test:", a.imageUrl);
  const res = await fetch(config.DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "\uD83D\uDD75\uFE0F Comic Hunter",
      embeds: [{
        title: "[BIG IMAGE TEST] " + a.title.slice(0, 50),
        url: "https://reddit.com",
        color: 0x57f287,
        description: "Full-width embed.image test — should be large.",
        image: { url: a.imageUrl },
        footer: { text: "comic_hunter • image size test" },
        timestamp: new Date().toISOString(),
      }],
    }),
  });
  console.log("Discord:", res.status, res.statusText);
  await prisma.$disconnect();
}
main();
