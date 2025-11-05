import { prisma } from "./src/lib/prisma";

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { id: 3 },
    select: {
      id: true,
      email: true,
      name: true,
      telegramId: true,
      role: true,
      organizationId: true
    }
  });
  
  console.log('User 3:', user);
  console.log('Telegram ID:', user?.telegramId || 'NOT LINKED');
  
  if (!user?.telegramId) {
    console.log('\n⚠️ USER IS NOT LINKED TO TELEGRAM!');
    console.log('To link user, use: Generate Admin Link in Bot Management page');
  } else {
    console.log('\n✅ User is linked to Telegram ID:', user.telegramId);
  }
}

checkUser().then(() => process.exit(0)).catch(console.error);
