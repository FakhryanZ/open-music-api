/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('playlist', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('playlist')
}
