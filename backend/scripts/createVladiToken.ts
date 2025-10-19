import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-jwt-key';

// Данные пользователя Vladi
const userData = {
  userId: 2,
  email: 'some@example.com',
  name: 'Vladi',
  role: 'OWNER',
  organizationId: 2,
  organization: {
    id: 2,
    name: 'Demo Org'
  }
};

// Создаем токен
const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 JWT Token for Vladi (Demo Org):');
console.log(token);
console.log('\n📋 User Info:');
console.log(`- User ID: ${userData.userId}`);
console.log(`- Email: ${userData.email}`);
console.log(`- Name: ${userData.name}`);
console.log(`- Role: ${userData.role}`);
console.log(`- Organization ID: ${userData.organizationId}`);
console.log(`- Organization Name: ${userData.organization.name}`);
