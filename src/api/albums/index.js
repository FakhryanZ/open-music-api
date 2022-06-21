const AlbumsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (
    server,
    { service, songsService, storageService, likesService, validator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      service,
      songsService,
      storageService,
      likesService,
      validator
    )
    server.route(routes(albumsHandler))
  },
}

