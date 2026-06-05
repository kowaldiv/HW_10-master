/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email", 255).notNullable().unique();
      table.string("name", 100).notNullable();
      table.enu("role", ["user", "admin"]).defaultTo("user");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("posts", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable();
      table.foreign("user_id").references("users.id").onDelete("CASCADE");
      table.string("title", 300).notNullable();
      table.text("body");
      table.string("status", 20).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })

    .createTable("comments", (table) => {
      table.increments("id").primary();
      table.integer("post_id").unsigned().notNullable();
      table.foreign("post_id").references("posts.id").onDelete("CASCADE");
      table.integer("author_id").unsigned();
      table.foreign("author_id").references("users.id").onDelete("SET NULL");
      table.text("body").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })

    .createTable("tags", (table) => {
      table.increments("id").primary();
      table.string("name", 50).unique().notNullable();
    })

    .createTable("post_tags", (table) => {
      table.integer("post_id").unsigned().notNullable();
      table.foreign("post_id").references("posts.id").onDelete("CASCADE");
      table.integer("tag_id").unsigned().notNullable();
      table.foreign("tag_id").references("tags.id").onDelete("CASCADE");
      table.primary(["post_id", "tag_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("post_tags")
    .dropTableIfExists("comments")
    .dropTableIfExists("posts")
    .dropTableIfExists("tags")
    .dropTableIfExists("users");
};
