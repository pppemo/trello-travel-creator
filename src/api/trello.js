import Trello from 'trello'

const APP_KEY = '6eb5a611804cfe96ca70d853d163d8cd'
const getTrelloToken = () => window.localStorage.trello_token
const INVALID_TOKEN = 'invalid token'

const responseHandler = response => new Promise((resolve, reject) => {
  if (typeof response === 'string' && response === INVALID_TOKEN) {
    reject(INVALID_TOKEN)
  } else {
    resolve(response)
  }
})

const client = () => new Trello(APP_KEY, getTrelloToken())

export default {
  authorize: () => new Promise((resolve, reject) => {
    delete window.localStorage.trello_token
    window.Trello.authorize({
      type: 'popup',
      persist: true,
      name: 'Trello Travel Creator',
      scope: {
        read: 'true',
        write: 'true' },
      success: resolve,
      error: reject,
      expiration: '30days'
    })
  }),

  isAuthorized: () => client()
    .makeRequest('get', `/1/tokens/${getTrelloToken()}`)
    .then(responseHandler),

  client,
  responseHandler,
}
