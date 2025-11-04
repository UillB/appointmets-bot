import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSystemAdmin() {
  try {
    console.log('🔧 Creating System Admin (admin@system.com)...');

    // Проверяем, существует ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@system.com' }
    });

    if (existingUser) {
      console.log('✅ User admin@system.com already exists');
      // Обновляем пароль на всякий случай
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword, role: 'SUPER_ADMIN' }
      });
      console.log('🔑 Password updated to: admin123');
      console.log(`📧 Email: admin@system.com`);
      console.log(`🔑 Password: admin123`);
      await prisma.$disconnect();
      return;
    }

    // 1. Создаем или находим организацию для суперадмина
    let systemOrg = await prisma.organization.findFirst({
      where: { name: 'System Organization' }
    });

    if (!systemOrg) {
      systemOrg = await prisma.organization.create({
        data: {
          name: 'System Organization',
          avatar: null,
          botToken: null,
          botUsername: null,
        }
      });
      console.log(`✅ System Organization created with ID: ${systemOrg.id}`);
    } else {
      console.log(`✅ Using existing System Organization (ID: ${systemOrg.id})`);
    }

    // 2. Создаем супер-админ пользователя
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const systemAdminUser = await prisma.user.create({
      data: {
        email: 'admin@system.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        organizationId: systemOrg.id,
        telegramId: null,
      }
    });

    console.log(`✅ System Admin User created with ID: ${systemAdminUser.id}`);
    console.log(`📧 Email: admin@system.com`);
    console.log(`🔑 Password: admin123`);
    console.log(`🏢 Organization ID: ${systemOrg.id}`);

    // 3. Проверяем что все создалось
    const org = await prisma.organization.findUnique({
      where: { id: systemOrg.id },
      include: { users: true }
    });

    console.log('\n📊 System Organization Details:');
    console.log(JSON.stringify(org, null, 2));

  } catch (error) {
    console.error('❌ Error creating System Admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSystemAdmin();

