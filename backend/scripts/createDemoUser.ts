import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('👤 Creating demo user for Demo Org...');
    
    // Проверяем, есть ли уже пользователь в Demo Org
    const existingUser = await prisma.user.findFirst({
      where: {
        organizationId: 2
      }
    });

    if (existingUser) {
      console.log(`✅ User already exists: ${existingUser.name} (${existingUser.email})`);
      
      // Обновляем пароль
      const hashedPassword = await bcrypt.hash('demo123', 12);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      
      console.log('🔑 Password updated to: demo123');
      return;
    }

    // Создаем нового пользователя
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'demo@demo.org',
        password: hashedPassword,
        name: 'Demo User',
        role: 'OWNER',
        organizationId: 2
      },
      include: {
        organization: true
      }
    });

    console.log('✅ Demo user created successfully:');
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Password: demo123`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Organization: ${user.organization.name} (ID: ${user.organization.id})`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
