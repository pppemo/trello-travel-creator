import React, { Component, Fragment } from 'react'
import Trello from './../../api/trello'
import NewFlightSegmentForm from './../../components/NewFlightSegmentForm'
import FlightStatusNotifications from './../../notifications/flightStatusNotifications'
import IntegrationsNotifications from './../../components/IntegrationsNotifications'
import * as moment from 'moment'
import { Form, Select, NestedField } from 'react-form'
import { Button, Row, Col, ButtonToolbar } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import './AddFlight.css'
import BitlyGateway from './../../api/bitly'
import Spinner from './../../components/Spinner'
import { PulseLoader } from 'react-spinners'
import Timezones from 'google-timezones-json'

const PREFERRED_BOARD_NAME = 'Flights log'
const CHECKLISTS_LIST_NAME = 'CHECKLISTS'
const UPCOMING_FLIGHTS_LIST_NAME = 'Upcoming flights'
const NEW_FLIGHT_CARD_NAME = 'New flight'

class AddFlight extends Component {
  constructor(params) {
    super(params);
    this.state = {
      isLoadingBoards: true,
      isLoadingCards: false,
      isSaving: false,
      boards: [],
      newFlightCard: null
    }
  }

  componentDidMount() {
    Trello.client().getBoards('me')
      .then(boards => this.setState({ boards, isLoadingBoards: false }, () => {
        const defaultBoardId = this.getDefaultBoardId()
        if (defaultBoardId) {
          this.onBoardChange(defaultBoardId)
        }
      }))
      .catch(error => console.log(error))
  }

  getActiveBoards = () => this.state.boards.filter(board => !board.closed)

  fetchLists = boardId => Trello.client().getListsOnBoard(boardId)

  fetchCards = listId => Trello.client().getCardsOnList(listId)

  buildFlightSegments = flightSegments => flightSegments.map(flightSegment => {
    const { fromIata, toIata, flightNumber, res, fromTimezone, toTimezone, takeOffDate, departure, arrival } = flightSegment
    const INPUT_TIMESTAMP_FORMAT = 'YYMMDD HH:mm ZZ'
    const fromTimeShift = Timezones[fromTimezone].substr(4,6)
    const toTimeShift = Timezones[toTimezone].substr(4,6)

    return {
      ...flightSegment,
      fromIata: fromIata && fromIata.toUpperCase(),
      toIata: toIata && toIata.toUpperCase(),
      flightNumber: flightNumber && flightNumber.toUpperCase(),
      res: res && res.toUpperCase(),
      departureTimestamp: moment(`${takeOffDate} ${departure} ${fromTimeShift}`, INPUT_TIMESTAMP_FORMAT).format(),
      arrivalTimestamp: moment(`${takeOffDate} ${arrival} ${toTimeShift}`, INPUT_TIMESTAMP_FORMAT).format(),
      fromTimeShift,
      toTimeShift
    }
  })

  saveFlightSegments = form => {
    const { newFlightCard } = this.state
    const flightSegments = this.buildFlightSegments(form.flightSegments)
    this.setState({ isSaving: true })

    this.fetchLists(newFlightCard.idBoard).then(response => {
      const upcomingFlightsList = response.find(list => list.name === UPCOMING_FLIGHTS_LIST_NAME)
      if (upcomingFlightsList) {
        const promises = []
        flightSegments.forEach((flightSegment, flightSegmentNumber) => {
          promises.push(
            this.createNewFlightSegmentCard(flightSegment, flightSegmentNumber, newFlightCard, upcomingFlightsList.id, flightSegments))
          promises.push(
            this.addCalendarEvent(flightSegment))
          }
        )
        return Promise.all(promises)
      } else {
        throw new Error(`There's no list named "${UPCOMING_FLIGHTS_LIST_NAME}"`)
      }
    }).then(() => alert('Done!'))
      .catch(error => {
        alert(error)
      }).finally(() => this.setState({ isSaving: false }))
  }

  createNewFlightSegmentCard = (flightSegment, flightSegmentNumber, newFlightCard, upcomingFlightsListId, flightSegments) => {
    const { takeOffDate, flightNumber, airlineName, fromIata, toIata, res } = flightSegment
    const desc = newFlightCard.desc.replace('{reservation_number}', res)
    const cardName = `${takeOffDate} ${flightNumber} ${fromIata}->${toIata} ${airlineName}`
    const options = {
      idCardSource: newFlightCard.id,
      pos: 'bottom',
      desc
    }

    return Trello.client().addCardWithExtraParams(cardName, options, upcomingFlightsListId)
      .then(card => this.addFlightStatusNotifications(card.id, flightSegment, flightSegmentNumber, flightSegments))
  }

  addFlightStatusNotifications = (flightCardId, flightSegment, flightSegmentNumber, flightSegments) => {
    const isFirstSegment = flightSegmentNumber === 0
    const hasFollowingSegment = flightSegments.length - 1 !== flightSegmentNumber
    const { flightNumber, airlineName, fromIata, toIata, fromName, toName, departureTimestamp, arrivalTimestamp, destinationOutsideEU } = flightSegment

    const arrivalNotification = FlightStatusNotifications
      .buildArrivalNotification(toName, toIata, hasFollowingSegment, flightSegments[flightSegmentNumber + 1])

    const delayedFlightNotification = FlightStatusNotifications
      .buildDelayedFlightNotification(fromName, toName)

    return Promise.all([
      Trello.client().addCommentToCard(flightCardId, arrivalNotification),
      Trello.client().addCommentToCard(flightCardId, delayedFlightNotification)
    ]).then(() => {
      return BitlyGateway.shortenUrl(`https://www.flightradar24.com/${flightNumber}`).then(response => {
        const { link } = response.data
        let flightPendingNotification = FlightStatusNotifications
          .buildFlightPendingNotification(fromName, fromIata, toName, toIata, flightNumber, airlineName, departureTimestamp, arrivalTimestamp, link, destinationOutsideEU)
        if (isFirstSegment) {
          const flightPlanNotification = FlightStatusNotifications.buildFlightPlanNotification(flightSegments)
          flightPendingNotification = `${flightPlanNotification} ${flightPendingNotification}`
        }
        return Trello.client().addCommentToCard(flightCardId, flightPendingNotification)
      })
    })
  }

  addCalendarEvent = flightSegment => {
    // #Flight easyJet U23817 CDG->KRK R/EW8LVHN
    const { airlineName, flightNumber, fromIata, toIata, res, departureTimestamp, arrivalTimestamp, fromTimezone, toTimezone } = flightSegment
    const summary = `#Flight ${airlineName} ${flightNumber} ${fromIata}->${toIata} R/${res}`
    const resource = {
      description: 'my Description ✈️',
      summary,
//      attendees: [{
//        email: 'jaskuczera@gmail.com'
//      }],
      start: {
        dateTime: departureTimestamp,
        timeZone: fromTimezone
      },
      end: {
        dateTime: arrivalTimestamp,
        timeZone: toTimezone
      }
    }
    return window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource,
      sendNotifications: true
    })
  }

  getDefaultBoardId = () => {
    const defaultBoard = this.getActiveBoards().find(board => board.name === PREFERRED_BOARD_NAME)
    return defaultBoard ? defaultBoard.id : undefined
  }

  onBoardChange = boardId => {
    this.setState({ isLoadingCards: true })
    this.fetchLists(boardId).then(response => {
      const checklistsList = response.find(list => list.name === CHECKLISTS_LIST_NAME)
      if (checklistsList) {
        return this.fetchCards(checklistsList.id)
      } else {
        this.setState({ newFlightCard: null })
        throw new Error(`There's no list named "${CHECKLISTS_LIST_NAME}"`)
      }
    }).then(response => {
      const newFlightCard = response.find(card => card.name === NEW_FLIGHT_CARD_NAME)
      if (newFlightCard) {
        this.setState({ newFlightCard })
      } else {
        this.setState({ newFlightCard: null })
        throw new Error(`There's no card named "${NEW_FLIGHT_CARD_NAME}"`)
      }
    }).catch(error => {
      alert(error)
    }).finally(() => this.setState({ isLoadingCards: false }))
  }

  addFlightRow = formApi => formApi.setValue('flightSegments', formApi.values.flightSegments.concat({}))

  render() {
    const { isLoadingBoards, isLoadingCards, newFlightCard, isSaving } = this.state

    return (
      <div >
        <IntegrationsNotifications />
        {isLoadingBoards ? <Spinner /> : <Form defaultValues={{ board: this.getDefaultBoardId(), flightSegments: [{}] }}
          onSubmit={this.saveFlightSegments} >
          {formApi => (
            <form id="boardsForm">
              <Row>
                <Col xs={4}>
                  <Select field="board"
                    className="form-control"
                    id="select-input-board"
                    onChange={this.onBoardChange}
                    options={this.getActiveBoards().map(board => ({ label: board.name, value: board.id }))} />
                </Col>
                <Col xs={8}>
                  {newFlightCard && <ButtonToolbar>
                    <Button bsStyle="success" onClick={() => this.addFlightRow(formApi)}><FontAwesome name="plus" /> Leg</Button>
                    <Button bsStyle="danger"
                      onClick={() => formApi.setValue('flightSegments', [])}><FontAwesome name="trash" /> Clear</Button>
                    <Button bsStyle="primary" onClick={formApi.submitForm} disabled={isSaving}>Save</Button>
                    {isSaving && <PulseLoader color="#337ab7" className="AddFlight-savingSpinner" />}
                  </ButtonToolbar>}
                </Col>
              </Row>

              <div className="addFlightRows">
                <Row>
                  <Col xs={1}>Departure date</Col>
                  <Col xs={1}>From</Col>
                  <Col xs={1}>To</Col>
                  <Col xs={1}>Destination outside EU</Col>
                  <Col xs={1}>Departure</Col>
                  <Col xs={1}>Arrival</Col>
                  <Col xs={1}>Flight no.<br/>Airline</Col>
                  <Col xs={1}>Reservation</Col>
                </Row>
              </div>

              {isLoadingCards ? <Spinner /> : (<Fragment>
                {newFlightCard && formApi.values.flightSegments.map((_element, i) =>
                  <NestedField key={`flightSegments${i}`}
                    field={['flightSegments', i]}
                    formApi={formApi}
                    component={NewFlightSegmentForm} />)}
              </Fragment>
              )}
            </form>
          )}
        </Form>}
      </div>
    );
  }
}

export default AddFlight
