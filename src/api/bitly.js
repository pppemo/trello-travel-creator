import axios from 'axios'

const API_KEY = '2d478fb667b25e4f9648bb844e8f211918f40c7d'
const GROUP_ID = 'Bj11h5g7QFN'

const bitlyClient = () => axios.create({
  baseURL: 'https://api-ssl.bitly.com/v4',
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'content-type': 'application/json'
  }
})

export default {
  shortenUrl: long_url => bitlyClient().post('/shorten', {
    group_guid: GROUP_ID,
    long_url
  })
}
