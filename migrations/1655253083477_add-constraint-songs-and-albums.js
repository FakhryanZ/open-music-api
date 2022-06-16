/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint(
    'songs',
    'fk_songs.albumId_album.id',
    'FOREIGN KEY("albumId") REFERENCES albums(id) on DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint('songs', '`fk_songs.album_id_album.id`')
}
