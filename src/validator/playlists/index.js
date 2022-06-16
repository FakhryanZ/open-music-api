const InvariantError = require('../../exceptions/InvariantError')
const {
  PostPlaylistPayloadSchema,
  PostSongInPlaylistPayloadSchema,
} = require('./schema')

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },

  validateSongInPlaylistPayload: (payload) => {
    const validationResult = PostSongInPlaylistPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

module.exports = PlaylistsValidator
