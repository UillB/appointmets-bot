import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create a default organization for super admin
    const organization = await prisma.organization.create({
      data: {
        name: 'System Administration'
      }
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@system.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        organizationId: organization.id
      },
      include: {
        organization: true
      }
    });

    console.log('Super admin created successfully:');
    console.log('Email:', superAdmin.email);
    console.log('Password: admin123');
    console.log('Role:', superAdmin.role);
    console.log('Organization:', superAdmin.organization.name);

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
