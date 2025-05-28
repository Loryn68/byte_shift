const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, password, first_name, last_name, email, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', hashedPassword, 'System', 'Administrator', 'admin@childmentalhaven.org', 'admin', true]);

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
