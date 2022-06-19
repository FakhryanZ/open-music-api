const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
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
      text: `SELECT playlist.id, playlist.name, users.username FROM playlist 
      LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id
      INNER JOIN users ON users.id = playlist.owner
      WHERE playlist.owner=$1 OR collaborations.user_id = $1`,
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

  async addActivity(playlistId, songId, owner, action) {
    const id = `activities-${nanoid(16)}`
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, owner, action, date],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getActivities(playlistId) {
    const activitiesQuery = {
      text: 'SELECT playlist_id FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId],
    }
    const activitiesResult = await this._pool.query(activitiesQuery)

    const activitiesJoinWithUsersQuery = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
      FROM playlist_song_activities 
      INNER JOIN users ON playlist_song_activities.user_id = users.id 
      INNER JOIN songs ON playlist_song_activities.song_id = songs.id
      WHERE playlist_id = $1`,

      values: [playlistId],
    }

    const activitiesJoinWithUserResult = await this._pool.query(
      activitiesJoinWithUsersQuery
    )

    const playlist = activitiesResult.rows[0].playlist_id

    const activities = activitiesJoinWithUserResult.rows

    return {
      playlistId: playlist,
      activities,
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService

