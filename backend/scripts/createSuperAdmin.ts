import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating Super Admin organization and user...');

    // 1. Создаем супер-админ организацию
    const superAdminOrg = await prisma.organization.create({
      data: {
        name: 'Super Admin Organization',
        avatar: null,
        botToken: null,
        botUsername: null,
      }
    });

    console.log(`✅ Super Admin Organization created with ID: ${superAdminOrg.id}`);

    // 2. Создаем супер-админ пользователя
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdminUser = await prisma.user.create({
      data: {
        email: 'admin@superadmin.com',
        password: hashedPassword,
        name: 'Super Administrator',
        role: 'SUPER_ADMIN',
        organizationId: superAdminOrg.id,
        telegramId: null,
      }
    });

    console.log(`✅ Super Admin User created with ID: ${superAdminUser.id}`);
    console.log(`📧 Email: admin@superadmin.com`);
    console.log(`🔑 Password: admin123`);
    console.log(`🏢 Organization ID: ${superAdminOrg.id}`);

    // 3. Проверяем что все создалось
    const org = await prisma.organization.findUnique({
      where: { id: superAdminOrg.id },
      include: { users: true }
    });

    console.log('\n📊 Super Admin Organization Details:');
    console.log(JSON.stringify(org, null, 2));

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();