import { prisma } from '../lib/prisma';

async function testAuthFlow() {
  const testUser = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  };

  try {
    // Cleanup any existing test data
    await prisma.session.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    // Test registration
    const registerRes = await fetch('http://localhost:9002/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!registerRes.ok) throw new Error(`Register failed: ${await registerRes.text()}`);
    console.log('✓ Register successful');
    
    const registerData = await registerRes.json();
    console.log('User:', registerData.user);
    
    // Get session cookie
    const cookies = registerRes.headers.get('set-cookie');
    console.log('Session cookie:', cookies);

    // Test session endpoint
    const sessionRes = await fetch('http://localhost:9002/api/auth/session', {
      headers: cookies ? { cookie: cookies } : undefined
    });
    
    if (!sessionRes.ok) throw new Error('Session check failed');
    const sessionData = await sessionRes.json();
    console.log('✓ Session valid:', sessionData.user);

    // Test logout
    const logoutRes = await fetch('http://localhost:9002/api/auth/logout', {
      method: 'POST',
      headers: cookies ? { cookie: cookies } : undefined
    });
    
    if (!logoutRes.ok) throw new Error('Logout failed');
    console.log('✓ Logout successful');

    // Verify session invalidated
    const checkRes = await fetch('http://localhost:9002/api/auth/session', {
      headers: cookies ? { cookie: cookies } : undefined
    });
    const checkData = await checkRes.json();
    if (checkData.user) throw new Error('Session still valid after logout');
    console.log('✓ Session properly invalidated');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Final cleanup
    await prisma.session.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  }
}

testAuthFlow();