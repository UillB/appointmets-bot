import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Создаем тестовые токены для разных пользователей
function createTestToken(userId: number, email: string, name: string, role: string, organizationId: number) {
  return jwt.sign(
    { userId, email, name, role, organizationId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function testDataIsolation() {
  console.log('🧪 Тестирование изоляции данных между организациями...\n');

  try {
    // Получаем организации
    const organizations = await prisma.organization.findMany({
      include: {
        users: true,
        services: {
          include: {
            appointments: true
          }
        }
      }
    });

    if (organizations.length < 2) {
      console.log('❌ Недостаточно организаций для тестирования. Нужно минимум 2 организации.');
      return;
    }

    const org1 = organizations[0];
    const org2 = organizations[1];

    console.log(`📋 Организация 1: ${org1.name} (ID: ${org1.id})`);
    console.log(`   - Пользователей: ${org1.users.length}`);
    console.log(`   - Услуг: ${org1.services.length}`);
    console.log(`   - Записей: ${org1.services.reduce((sum, s) => sum + s.appointments.length, 0)}`);

    console.log(`📋 Организация 2: ${org2.name} (ID: ${org2.id})`);
    console.log(`   - Пользователей: ${org2.users.length}`);
    console.log(`   - Услуг: ${org2.services.length}`);
    console.log(`   - Записей: ${org2.services.reduce((sum, s) => sum + s.appointments.length, 0)}\n`);

    // Создаем токены для пользователей из разных организаций
    const user1 = org1.users[0];
    const user2 = org2.users[0];

    if (!user1 || !user2) {
      console.log('❌ Недостаточно пользователей в организациях для тестирования.');
      return;
    }

    const token1 = createTestToken(user1.id, user1.email, user1.name, user1.role, org1.id);
    const token2 = createTestToken(user2.id, user2.email, user2.name, user2.role, org2.id);

    console.log(`🔑 Созданы тестовые токены:`);
    console.log(`   - Пользователь 1: ${user1.email} (Org: ${org1.name})`);
    console.log(`   - Пользователь 2: ${user2.email} (Org: ${org2.name})\n`);

    // Тестируем API endpoints
    const baseUrl = 'http://localhost:4000/api';

    // Тест 1: Получение записей
    console.log('🧪 Тест 1: Получение записей через API...');
    
    try {
      const response1 = await fetch(`${baseUrl}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token1}`,
          'Content-Type': 'application/json'
        }
      });
      
      const response2 = await fetch(`${baseUrl}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token2}`,
          'Content-Type': 'application/json'
        }
      });

      if (response1.ok && response2.ok) {
        const data1 = await response1.json();
        const data2 = await response2.json();
        
        console.log(`   ✅ Пользователь 1 видит ${data1.appointments.length} записей`);
        console.log(`   ✅ Пользователь 2 видит ${data2.appointments.length} записей`);
        
        // Проверяем, что записи принадлежат правильным организациям
        const org1Appointments = data1.appointments.filter((apt: any) => 
          apt.service.organizationId === org1.id
        );
        const org2Appointments = data2.appointments.filter((apt: any) => 
          apt.service.organizationId === org2.id
        );
        
        // Пользователь 1 - Super Admin, должен видеть ВСЕ записи
        if (user1.role === 'SUPER_ADMIN') {
          console.log(`   ✅ Super Admin видит все записи (${data1.appointments.length} записей)`);
        } else if (org1Appointments.length === data1.appointments.length) {
          console.log(`   ✅ Пользователь 1 видит только записи своей организации`);
        } else {
          console.log(`   ❌ ПРОБЛЕМА: Пользователь 1 видит записи других организаций!`);
        }
        
        // Пользователь 2 - обычный пользователь, должен видеть только свои записи
        if (org2Appointments.length === data2.appointments.length) {
          console.log(`   ✅ Пользователь 2 видит только записи своей организации`);
        } else {
          console.log(`   ❌ ПРОБЛЕМА: Пользователь 2 видит записи других организаций!`);
        }
      } else {
        console.log(`   ❌ Ошибка API: ${response1.status} / ${response2.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Ошибка при тестировании API: ${error}`);
    }

    // Тест 2: Получение услуг
    console.log('\n🧪 Тест 2: Получение услуг через API...');
    
    try {
      const response1 = await fetch(`${baseUrl}/services`, {
        headers: {
          'Authorization': `Bearer ${token1}`,
          'Content-Type': 'application/json'
        }
      });
      
      const response2 = await fetch(`${baseUrl}/services`, {
        headers: {
          'Authorization': `Bearer ${token2}`,
          'Content-Type': 'application/json'
        }
      });

      if (response1.ok && response2.ok) {
        const data1 = await response1.json();
        const data2 = await response2.json();
        
        console.log(`   ✅ Пользователь 1 видит ${data1.services.length} услуг`);
        console.log(`   ✅ Пользователь 2 видит ${data2.services.length} услуг`);
        
        // Проверяем, что услуги принадлежат правильным организациям
        const org1Services = data1.services.filter((srv: any) => srv.organizationId === org1.id);
        const org2Services = data2.services.filter((srv: any) => srv.organizationId === org2.id);
        
        // Пользователь 1 - Super Admin, должен видеть ВСЕ услуги
        if (user1.role === 'SUPER_ADMIN') {
          console.log(`   ✅ Super Admin видит все услуги (${data1.services.length} услуг)`);
        } else if (org1Services.length === data1.services.length) {
          console.log(`   ✅ Пользователь 1 видит только услуги своей организации`);
        } else {
          console.log(`   ❌ ПРОБЛЕМА: Пользователь 1 видит услуги других организаций!`);
        }
        
        // Пользователь 2 - обычный пользователь, должен видеть только свои услуги
        if (org2Services.length === data2.services.length) {
          console.log(`   ✅ Пользователь 2 видит только услуги своей организации`);
        } else {
          console.log(`   ❌ ПРОБЛЕМА: Пользователь 2 видит услуги других организаций!`);
        }
      } else {
        console.log(`   ❌ Ошибка API: ${response1.status} / ${response2.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Ошибка при тестировании API: ${error}`);
    }

    console.log('\n🎯 Тестирование завершено!');
    console.log('💡 Если все тесты прошли успешно, изоляция данных работает корректно.');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testDataIsolation();
