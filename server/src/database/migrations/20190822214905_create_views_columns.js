
exports.up = function (knex) {
  return knex.schema.createTable('view_has_columns', (table) => {
    table.increments();
    table.integer('view_id').unsigned();
    table.integer('field_id').unsigned();
    table.integer('index').unsigned();
  }).raw('ALTER TABLE `ITEMS_CATEGORIES` AUTO_INCREMENT = 1000').then(() => {

  });
};

exports.down = (knex) => knex.schema.dropTableIfExists('view_has_columns');
