import Trello from 'trello'

const APP_KEY = '6eb5a611804cfe96ca70d853d163d8cd'
const getTrelloToken = () => window.localStorage.trello_token

export default {
  authorize: () => {
    window.Trello.authorize({
      type: 'popup',
      persist: true,
      name: 'Trello Travel Creator',
      scope: {
        read: 'true',
        write: 'true' },
      expiration: '1day'
    })
  },

  client: () => new Trello(APP_KEY, getTrelloToken()),

  isAuthorized: () => getTrelloToken()
}
