// Migration to create posts table
export async function up(knex) {
  if (await knex.schema.hasTable('posts')) return;

  // Detect users.id type
  let userIdIsInteger = false;
  try {
    const res = await knex.raw("SELECT pg_typeof(id) AS t FROM users LIMIT 1");
    if (res && res.rows && res.rows[0] && res.rows[0].t === 'integer') userIdIsInteger = true;
  } catch (e) {
    // Default to integer false -> use uuid
  }

  return knex.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('content').notNullable();
    if (userIdIsInteger) table.integer('user_id').unsigned().notNullable();
    else table.uuid('user_id').notNullable();
    table.timestamps(true, true); // Creates created_at and updated_at columns
    
    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex) {
  if (!(await knex.schema.hasTable('posts'))) return;
  return knex.schema.dropTable('posts');
}
