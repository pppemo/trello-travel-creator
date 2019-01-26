import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import Trello from './../../api/trello'
import ApiCalendar from 'react-google-calendar-api'

class Integrations extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isTrelloAuthorized: false,
      isGoogleCalendarAuthorized: false,
      isGoogleCalendarApiLoaded: false
    }
  }

  authorizeTrello = () => Trello.authorize()
  authorizeGoogleCalendar = () => ApiCalendar.handleAuthClick()

  componentDidMount() {
    this.setState({ isTrelloAuthorized: Trello.isAuthorized() })
    ApiCalendar.onLoad(() => this.setState({
      isGoogleCalendarApiLoaded: true,
      isGoogleCalendarAuthorized: window.gapi.auth2.getAuthInstance().isSignedIn.get()
    })
    )
  }

  render() {
    const { isTrelloAuthorized, isGoogleCalendarApiLoaded, isGoogleCalendarAuthorized } = this.state

    return (
      <div>
        {!isTrelloAuthorized && <Button onClick={this.authorizeTrello}>Trello - connect</Button>}
        {isGoogleCalendarApiLoaded && isGoogleCalendarAuthorized
          && <Button onClick={this.authorizeGoogleCalendar}>Google Calendar - connect</Button>}
      </div>
    )
  }
}

export default Integrations
