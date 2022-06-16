const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService
    this._songsService = songsService
    this._validator = validator

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
    this.postSongInPlaylistHandler = this.postSongInPlaylistHandler.bind(this)
    this.getSongsInPlaylistHandler = this.getSongsInPlaylistHandler.bind(this)
    this.deleteSongInPlaylistHandler =
      this.deleteSongInPlaylistHandler.bind(this)
    this.getActivitiesHandler = this.getActivitiesHandler.bind(this)
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload)

      const { id: credentialId } = request.auth.credentials
      const { name } = request.payload

      const playlistId = await this._playlistsService.addPlaylist({
        name,
        owner: credentialId,
      })

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      })
      response.code(201)

      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })

      response.code(500)
      console.error(error)

      return response
    }
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._playlistsService.getPlaylist(credentialId)

    return {
      status: 'success',
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistOwner(id, credentialId)
      await this._playlistsService.deletePlaylistById(id)

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }

  async getSongsInPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      )
      const playlist = await this._playlistsService.getSongsInPlaylist(
        playlistId
      )

      return {
        status: 'success',
        data: {
          playlist,
        },
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }

  async deleteSongInPlaylistHandler(request, h) {
    try {
      this._validator.validateSongInPlaylistPayload(request.payload)
      const { id: playlistId } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      )
      await this._playlistsService.deleteSongInPlaylist(playlistId, songId)

      await this._playlistsService.addActivity(
        playlistId,
        songId,
        credentialId,
        'delete'
      )

      return {
        status: 'success',
        message: 'Lagu berhasil dari playlist',
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }

  async postSongInPlaylistHandler(request, h) {
    try {
      this._validator.validateSongInPlaylistPayload(request.payload)
      const { id: playlistId } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      )
      await this._songsService.getSongById(songId)
      const playlistSongId = await this._playlistsService.addSongInPlaylist(
        playlistId,
        songId
      )

      await this._playlistsService.addActivity(
        playlistId,
        songId,
        credentialId,
        'add'
      )

      const response = h.response({
        status: 'success',
        message: 'lagu berhasil ditambahkan ke playlist',
        data: {
          playlistSongId,
        },
      })
      response.code(201)

      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }

  async getActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      )
      const activities = await this._playlistsService.getActivities(playlistId)

      return {
        status: 'success',
        data: activities,
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }
}

module.exports = PlaylistsHandler
