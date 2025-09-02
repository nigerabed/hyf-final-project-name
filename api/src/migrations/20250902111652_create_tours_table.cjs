exports.up = function (knex) {
  return knex.schema.createTable("tours", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").notNullable();
    table.string("destination").notNullable();
    table.decimal("price_usd", 10, 2).notNullable();
    table.integer("duration_days").notNullable();
    table.string("cover_image_url");
    table.decimal("average_rating", 3, 2);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tours");
};
