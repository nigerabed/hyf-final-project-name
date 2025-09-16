/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (!(await knex.schema.hasTable('posts'))) return;
  const hasCol = await knex.schema.hasColumn('posts', 'cover_image_url');
  if (hasCol) return;
  await knex.schema.alterTable('posts', (table) => {
    table.string('cover_image_url').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  if (!(await knex.schema.hasTable('posts'))) return;
  const hasCol = await knex.schema.hasColumn('posts', 'cover_image_url');
  if (!hasCol) return;
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumn('cover_image_url');
  });
}
