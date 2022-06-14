const Joi = require('joi')

const PostAuthenticationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
})

const PutAuthenticationSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

const DeleteAuthenticationSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

module.exports = {
  PostAuthenticationSchema,
  PutAuthenticationSchema,
  DeleteAuthenticationSchema,
}
