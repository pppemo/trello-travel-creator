import React, { Component } from 'react'
import Trello from './../../api/trello'
import ApiCalendar from 'react-google-calendar-api'

class IntegrationsNotifications extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isTrelloAuthorized: false,
      isGoogleCalendarAuthenticated: false,
      isGoogleCalendarApiLoaded: false
    }
  }

  componentDidMount() {
    this.setState({ isTrelloAuthorized: Trello.isAuthorized() })
    ApiCalendar.onLoad(() => {
      this.setState({
        isGoogleCalendarApiLoaded: true,
        isGoogleCalendarAuthenticated: window.gapi.auth2.getAuthInstance().isSignedIn.get()
      })
    })
  }

  render() {
    const { isTrelloAuthorized, isGoogleCalendarApiLoaded, isGoogleCalendarAuthenticated } = this.state

    return (
      <div>
        {!isTrelloAuthorized && <div>Trello is not connected</div>}
        {isGoogleCalendarApiLoaded && !isGoogleCalendarAuthenticated && <div>Google Calendar is not connected</div>}
      </div>
    )
  }
}

export default IntegrationsNotifications
