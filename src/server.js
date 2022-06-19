const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

const albums = require('./api/albums')
const AlbumsService = require('./service/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

const songs = require('./api/songs')
const SongsService = require('./service/postgres/SongsService')
const SongsValidator = require('./validator/songs')

const users = require('./api/users')
const UsersService = require('./service/postgres/UsersService')
const UsersValidator = require('./validator/users')

const authentications = require('./api/authentications')
const AuthenticationsService = require('./service/postgres/AuthenticationsService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

const playlists = require('./api/playlists')
const PlaylistsService = require('./service/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

const collaborations = require('./api/collaborations')
const CollaborationsService = require('./service/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

const _export = require('./api/exports')
const ProducerService = require('./service/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

require('dotenv').config()

const init = async () => {
  const collaborationsService = new CollaborationsService()
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService(collaborationsService)

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.register([
    {
      plugin: Jwt,
    },
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        songsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _export,
      options: {
        exportsService: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()

