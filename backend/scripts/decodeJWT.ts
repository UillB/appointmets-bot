const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5Ac3lzdGVtLmNvbSIsIm5hbWUiOiJTeXN0ZW0gQWRtaW5pc3RyYXRvciIsInJvbGUiOiJTVVBFUl9BRE1JTiIsIm9yZ2FuaXphdGlvbklkIjoxLCJvcmdhbml6YXRpb24iOnsiaWQiOjEsIm5hbWUiOiJTeXN0ZW0gQWRtaW5pc3RyYXRpb24ifSwiaWF0IjoxNzYwODY3MDY2LCJleHAiOjE3NjA4NzA2NjZ9.BgWY0V0qqHhQjaPygkGzSFjzq6gENiW87Wc6Lkib8Bg";

// JWT состоит из трех частей, разделенных точками
const parts = token.split('.');
const payload = parts[1];

// Декодируем base64
const decoded = Buffer.from(payload, 'base64').toString('utf-8');
const user = JSON.parse(decoded);

console.log('🔍 JWT Token Info:');
console.log(`- User ID: ${user.userId}`);
console.log(`- Email: ${user.email}`);
console.log(`- Name: ${user.name}`);
console.log(`- Role: ${user.role}`);
console.log(`- Organization ID: ${user.organizationId}`);
console.log(`- Organization Name: ${user.organization.name}`);
