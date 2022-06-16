const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const AuthorizationError = require('../exceptions/AuthorizationError')
const InvariantError = require('../exceptions/InvariantError')
const NotFoundError = require('../exceptions/NotFoundError')

class PlaylistsService {
  constructor() {
    this._pool = new Pool()
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id=$1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus')
    }
  }

  async getPlaylist(owner) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner WHERE owner=$1',
      values: [owner],
    }
    const result = await this._pool.query(query)

    return result.rows
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id=$1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini')
    }
  }

  async getSongsInPlaylist(playlistId) {
    const playlistQuery = {
      text: `SELECT playlist.id, playlist.name, users.username
      FROM playlist_songs
      LEFT JOIN playlist ON playlist.id = playlist_songs.playlist_id
      LEFT JOIN users ON playlist.owner = users.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    }

    const playlistResult = await this._pool.query(playlistQuery)

    const songQuery = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    }

    const songResult = await this._pool.query(songQuery)

    const playlist = playlistResult.rows[0]

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songResult.rows,
    }
  }

  async addSongInPlaylist(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    }

    return result.rows[0].id
  }

  async deleteSongInPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist')
    }
  }
}

module.exports = PlaylistsService
