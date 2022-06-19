const ClientError = require('../../exceptions/ClientError')

class ExportHandler {
  constructor(exportsService, playlistsService, validator) {
    this._exportsService = exportsService
    this._playlistsService = playlistsService
    this._validator = validator

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this)
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload)
      const { id: playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      )

      const message = {
        userId: request.auth.credentials.id,
        targetEmail: request.payload.targetEmail,
      }

      await this._exportsService.sendMessage(
        'export:playlists',
        JSON.stringify(message)
      )

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
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
        message: 'Maaf, terjadi kegagalan pada server kami',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }
}

module.exports = ExportHandler

