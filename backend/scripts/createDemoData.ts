import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoData() {
  try {
    console.log('🎭 Creating demo data...');

    // 1. Создаем демо организации
    const demoOrgs = [
      {
        name: 'Психологический центр "Гармония"',
        avatar: null,
        botToken: null,
        botUsername: null,
      },
      {
        name: 'Медицинский центр "Здоровье+"',
        avatar: null,
        botToken: null,
        botUsername: null,
      },
      {
        name: 'Юридическая консультация "Право"',
        avatar: null,
        botToken: null,
        botUsername: null,
      }
    ];

    const createdOrgs = [];
    for (const orgData of demoOrgs) {
      const org = await prisma.organization.create({
        data: orgData
      });
      createdOrgs.push(org);
      console.log(`✅ Created organization: ${org.name} (ID: ${org.id})`);
    }

    // 2. Создаем пользователей для каждой организации
    const demoUsers = [
      {
        email: 'owner1@harmony.com',
        password: 'password123',
        name: 'Анна Петрова',
        role: 'OWNER',
        organizationId: createdOrgs[0].id,
      },
      {
        email: 'manager1@harmony.com',
        password: 'password123',
        name: 'Мария Иванова',
        role: 'MANAGER',
        organizationId: createdOrgs[0].id,
      },
      {
        email: 'owner2@health.com',
        password: 'password123',
        name: 'Дмитрий Сидоров',
        role: 'OWNER',
        organizationId: createdOrgs[1].id,
      },
      {
        email: 'owner3@law.com',
        password: 'password123',
        name: 'Елена Козлова',
        role: 'OWNER',
        organizationId: createdOrgs[2].id,
      }
    ];

    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        }
      });
      console.log(`✅ Created user: ${user.name} (${user.email}) for org ${user.organizationId}`);
    }

    // 3. Создаем услуги для каждой организации
    const demoServices = [
      // Психологический центр
      {
        name: 'Индивидуальная консультация психолога',
        nameRu: 'Индивидуальная консультация психолога',
        nameEn: 'Individual psychologist consultation',
        nameHe: 'ייעוץ פסיכולוגי אישי',
        description: 'Персональная консультация с опытным психологом',
        descriptionRu: 'Персональная консультация с опытным психологом',
        descriptionEn: 'Personal consultation with an experienced psychologist',
        descriptionHe: 'ייעוץ אישי עם פסיכולוג מנוסה',
        durationMin: 60,
        organizationId: createdOrgs[0].id,
      },
      {
        name: 'Семейная терапия',
        nameRu: 'Семейная терапия',
        nameEn: 'Family therapy',
        nameHe: 'טיפול משפחתי',
        description: 'Терапия для всей семьи',
        descriptionRu: 'Терапия для всей семьи',
        descriptionEn: 'Therapy for the whole family',
        descriptionHe: 'טיפול לכל המשפחה',
        durationMin: 90,
        organizationId: createdOrgs[0].id,
      },
      // Медицинский центр
      {
        name: 'Консультация терапевта',
        nameRu: 'Консультация терапевта',
        nameEn: 'General practitioner consultation',
        nameHe: 'ייעוץ רופא משפחה',
        description: 'Общая консультация врача-терапевта',
        descriptionRu: 'Общая консультация врача-терапевта',
        descriptionEn: 'General consultation with a therapist',
        descriptionHe: 'ייעוץ כללי עם רופא משפחה',
        durationMin: 30,
        organizationId: createdOrgs[1].id,
      },
      {
        name: 'УЗИ диагностика',
        nameRu: 'УЗИ диагностика',
        nameEn: 'Ultrasound diagnostics',
        nameHe: 'אבחון אולטרסאונד',
        description: 'Ультразвуковое исследование',
        descriptionRu: 'Ультразвуковое исследование',
        descriptionEn: 'Ultrasound examination',
        descriptionHe: 'בדיקת אולטרסאונד',
        durationMin: 45,
        organizationId: createdOrgs[1].id,
      },
      // Юридическая консультация
      {
        name: 'Юридическая консультация',
        nameRu: 'Юридическая консультация',
        nameEn: 'Legal consultation',
        nameHe: 'ייעוץ משפטי',
        description: 'Консультация по правовым вопросам',
        descriptionRu: 'Консультация по правовым вопросам',
        descriptionEn: 'Consultation on legal issues',
        descriptionHe: 'ייעוץ בנושאים משפטיים',
        durationMin: 60,
        organizationId: createdOrgs[2].id,
      }
    ];

    for (const serviceData of demoServices) {
      const service = await prisma.service.create({
        data: serviceData
      });
      console.log(`✅ Created service: ${service.name} for org ${service.organizationId}`);
    }

    // 4. Создаем слоты для услуг
    const services = await prisma.service.findMany();
    
    for (const service of services) {
      // Создаем слоты на следующие 7 дней
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        
        // Пропускаем выходные (суббота и воскресенье)
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Создаем слоты с 9:00 до 18:00 с интервалом в durationMin минут
        const startHour = 9;
        const endHour = 18;
        const slotDuration = service.durationMin;
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += slotDuration) {
            if (hour + (minute + slotDuration) / 60 > endHour) break;
            
            const startAt = new Date(date);
            startAt.setHours(hour, minute, 0, 0);
            
            const endAt = new Date(startAt);
            endAt.setMinutes(endAt.getMinutes() + slotDuration);
            
            await prisma.slot.create({
              data: {
                serviceId: service.id,
                startAt,
                endAt,
                capacity: 1
              }
            });
          }
        }
      }
      console.log(`✅ Created slots for service: ${service.name}`);
    }

    console.log('\n🎉 Demo data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Organizations: ${createdOrgs.length}`);
    console.log(`- Users: ${demoUsers.length}`);
    console.log(`- Services: ${demoServices.length}`);
    console.log(`- Slots: Generated for all services`);
    
    console.log('\n🔑 Demo credentials:');
    console.log('Super Admin: admin@superadmin.com / admin123');
    console.log('Owner 1: owner1@harmony.com / password123');
    console.log('Manager 1: manager1@harmony.com / password123');
    console.log('Owner 2: owner2@health.com / password123');
    console.log('Owner 3: owner3@law.com / password123');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoData();
