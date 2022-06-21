const ClientError = require('../../exceptions/ClientError')

class AlbumsHandler {
  constructor(service, songsService, storageService, validation) {
    this._service = service
    this._validation = validation
    this._songsService = songsService
    this._storageService = storageService

    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this)
  }

  async postAlbumHandler(request, h) {
    try {
      this._validation.validateAlbumPayload(request.payload)
      const { name = 'untitled', year } = request.payload

      const albumId = await this._service.addAlbum({ name, year })
      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
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
        status: 'fail',
        message: 'Maaf, terjadi kegagaln pada server kami.',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params
      const album = await this._service.getAlbumById(id)
      const songs = await this._songsService.getSongsByAlbumId(album.id)

      return {
        status: 'success',
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
            coverUrl: album.coverUrl,
            songs,
          },
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
        message: 'Maaf, terjadi kegagalan pada server kami',
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params
      this._validation.validateAlbumPayload(request.payload)
      await this._service.editAlbumById(id, request.payload)

      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
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

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params
      await this._service.deleteAlbumById(id)

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
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
        message: 'Maaf. terjadi kegagalan pada server kami',
      })
      response.code(500)
      return response
    }
  }

  async postAlbumCoverByIdHandler(request, h) {
    try {
      const { id } = request.params
      const { cover } = request.payload
      this._validation.validateCoverAlbumPayload(cover.hapi.headers)

      const fileLocation = await this._storageService.writeFile(
        cover,
        cover.hapi
      )

      await this._service.addCoverAlbumById(id, fileLocation)

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
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
}

module.exports = AlbumsHandler

