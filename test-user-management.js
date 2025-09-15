// Simple test to verify User Management API endpoints
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test users endpoint
    console.log('Testing /api/admin/users...');
    const usersResponse = await fetch(`${baseUrl}/api/admin/users`);
    const usersData = await usersResponse.json();
    console.log('Users:', usersData);
    
    // Test roles endpoint
    console.log('\nTesting /api/admin/roles...');
    const rolesResponse = await fetch(`${baseUrl}/api/admin/roles`);
    const rolesData = await rolesResponse.json();
    console.log('Roles:', rolesData);
    
    // Test permissions endpoint
    console.log('\nTesting /api/admin/permissions...');
    const permissionsResponse = await fetch(`${baseUrl}/api/admin/permissions`);
    const permissionsData = await permissionsResponse.json();
    console.log('Permissions:', permissionsData);
    
    // Test update user permissions
    console.log('\nTesting PUT /api/admin/users/1/permissions...');
    const updateResponse = await fetch(`${baseUrl}/api/admin/users/1/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permissions: ['manage_users', 'view_analytics']
      })
    });
    const updateData = await updateResponse.json();
    console.log('Update result:', updateData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run if server is available
testEndpoints();