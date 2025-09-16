/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // The posts table is named 'posts' in this project, so alter that table
  await knex.schema.alterTable('posts', (table) => {
    table.string('cover_image_url').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumn('cover_image_url');
  });
}
