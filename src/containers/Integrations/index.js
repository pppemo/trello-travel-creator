import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import Trello from './../../api/trello'
import ApiCalendar from 'react-google-calendar-api'

class Integrations extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isTrelloAuthorized: false,
      isTrelloApiLoaded: false,
      isGoogleCalendarAuthorized: false,
      isGoogleCalendarApiLoaded: false
    }
  }

  authorizeTrello = () => Trello.authorize()
    .then(() => this.setState({ isTrelloAuthorized: true }))

  authorizeGoogleCalendar = () => ApiCalendar.handleAuthClick()

  componentDidMount() {
    Trello.isAuthorized()
      .then(() => this.setState({ isTrelloAuthorized: true }))
      .catch(() => console.error('Trello not authorized'))
      .finally(() => this.setState({ isTrelloApiLoaded: true }))

    ApiCalendar.onLoad(() => this.setState({
        isGoogleCalendarApiLoaded: true,
        isGoogleCalendarAuthorized: window.gapi.auth2.getAuthInstance().isSignedIn.get()
      })
    )
  }

  render() {
    const {
      isTrelloAuthorized,
      isTrelloApiLoaded,
      isGoogleCalendarApiLoaded,
      isGoogleCalendarAuthorized
    } = this.state

    return (
      <div>
        <div>
          Trello:
          {!isTrelloApiLoaded && 'Checking...'}
          {isTrelloApiLoaded && !isTrelloAuthorized && <Button onClick={this.authorizeTrello}>Connect</Button>}
          {isTrelloApiLoaded && isTrelloAuthorized && 'Connected'}
        </div>
        <div>
          Google Calendar:
          {!isGoogleCalendarApiLoaded && 'Checking...'}
          {isGoogleCalendarApiLoaded && !isGoogleCalendarAuthorized && <Button onClick={this.authorizeGoogleCalendar}>Connect</Button>}
          {isGoogleCalendarApiLoaded && isGoogleCalendarAuthorized && 'Connected'}
        </div>
      </div>
    )
  }
}

export default Integrations
