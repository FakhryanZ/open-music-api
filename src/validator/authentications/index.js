const InvariantError = require('../../exceptions/InvariantError')
const {
  PostAuthenticationSchema,
  PutAuthenticationSchema,
  DeleteAuthenticationSchema,
} = require('./schema')

const AuthenticationValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },

  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeleteAuthenticationSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

module.exports = AuthenticationValidator
