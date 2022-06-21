const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class LikesService {
  constructor() {
    this._pool = new Pool()
  }

  async checkAlbumLike(id, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [id, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      return true
    }

    return false
  }

  async addAlbumLike(albumId, userId) {
    const id = `like-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan')
    }

    return result.rows[0]
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Like gagal dihapus. Album tidak ditemukan')
    }
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    }

    const { rows } = await this._pool.query(query)

    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return parseInt(rows[0].count, 10)
  }
}

module.exports = LikesService

