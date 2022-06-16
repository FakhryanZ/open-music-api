/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint(
    'playlist',
    'fk_users.id_playlist.owner',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint('playlist', 'fk_users.id_playlist.owner')
}
