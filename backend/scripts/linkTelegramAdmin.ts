import { prisma } from "../src/lib/prisma";

async function main() {
  const [, , telegramUserIdArg] = process.argv;
  const telegramUserId = telegramUserIdArg || process.env.TELEGRAM_USER_ID;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!telegramUserId) {
    console.error("Usage: TELEGRAM_USER_ID env or argument is required");
    process.exit(1);
  }
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN env is required to locate organization");
    process.exit(1);
  }

  // Find organization by bot token
  const org = await prisma.organization.findFirst({ where: { botToken } });
  if (!org) {
    console.error("Organization with current TELEGRAM_BOT_TOKEN not found");
    process.exit(1);
  }

  // Prefer OWNER, fallback to SUPER_ADMIN within same org
  const user = await prisma.user.findFirst({
    where: {
      organizationId: org.id,
      OR: [{ role: "OWNER" }, { role: "SUPER_ADMIN" }]
    },
    orderBy: [{ role: "desc" }]
  });

  if (!user) {
    console.error("No OWNER/SUPER_ADMIN user found for organization", org.id);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { telegramId: String(telegramUserId) }
  });

  console.log("✅ Linked Telegram user", telegramUserId, "to user", updated.id, "org", org.id);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });


