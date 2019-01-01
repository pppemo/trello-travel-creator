import React, { Component, Fragment } from 'react'
import Trello from './../../api/trello'
import NewFlightSegmentForm from './../../components/NewFlightSegmentForm'
import FlightStatusNotifications from './../../notifications/flightStatusNotifications'
import { Form, Select, NestedField } from 'react-form'
import { Button, Row, Col } from 'react-bootstrap'
import './AddFlight.css'

const PREFERRED_BOARD_NAME = 'Aviation'
const CHECKLISTS_LIST_NAME = 'CHECKLISTS'
const UPCOMING_FLIGHTS_LIST_NAME = 'Upcoming flights'
const NEW_FLIGHT_CARD_NAME = 'New flight'

class AddFlight extends Component {
  constructor(params) {
    super(params);
    this.state = {
      isLoadingBoards: true,
      isLoadingCards: false,
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
  }

  getActiveBoards = () => this.state.boards.filter(board => !board.closed)

  fetchLists = boardId => Trello.client().getListsOnBoard(boardId)

  fetchCards = listId => Trello.client().getCardsOnList(listId)

  fillAirportNames = flightSegments => flightSegments.map(flightSegment => {
    const airports = require('airport-data')
    const airportFrom = airports.find(airport => airport.iata === flightSegment.from)
    const airportTo = airports.find(airport => airport.iata === flightSegment.to)
    const fromName = airportFrom ? airportFrom.city : ''
    const toName = airportTo ? airportTo.city : ''

    return {
      ...flightSegment,
      fromName,
      toName
    }
  })

  saveFlightSegments = form => {
    const { newFlightCard } = this.state
    const flightSegments = this.fillAirportNames(form.flightSegments)

    this.fetchLists(newFlightCard.idBoard).then(response => {
      const upcomingFlightsList = response.find(list => list.name === UPCOMING_FLIGHTS_LIST_NAME)
      if (upcomingFlightsList) {
        flightSegments.forEach((flightSegment, flightSegmentNumber) => {
          this.createNewFlightSegmentCard(flightSegment, flightSegmentNumber, newFlightCard, upcomingFlightsList.id, flightSegments)
        })
      } else {
        throw new Error(`There's no list named "${UPCOMING_FLIGHTS_LIST_NAME}"`)
      }
    }).catch(error => {
      alert(error)
    })
  }

  createNewFlightSegmentCard = (flightSegment, flightSegmentNumber, newFlightCard, upcomingFlightsListId, flightSegments) => {
    const { takeOffDate, flightNumber, airlineName, from, to, res } = flightSegment
    const desc = newFlightCard.desc.replace('{reservation_number}', res)
    const cardName = `${takeOffDate} ${flightNumber} ${from}->${to} ${airlineName}`
    const options = {
      idCardSource: newFlightCard.id,
      pos: 'bottom',
      desc
    }

    Trello.client().addCardWithExtraParams(cardName, options, upcomingFlightsListId)
      .then(card => this.addFlightStatusNotifications(card.id, flightSegment, flightSegmentNumber, flightSegments))
  }

  addFlightStatusNotifications = (flightCardId, flightSegment, flightSegmentNumber, flightSegments) => {
    const isMultipleSegments = flightSegments.length > 1
    const isFirstSegment = flightSegmentNumber === 0
    const hasFollowingSegment = flightSegments.length - 1 !== flightSegmentNumber
    const { flightNumber, airlineName, from, to, fromName, toName, departure, arrival } = flightSegment

    const arrivalNotification = FlightStatusNotifications
      .buildArrivalNotification(toName, to, hasFollowingSegment, flightSegments[flightSegmentNumber + 1])
    Trello.client().addCommentToCard(flightCardId, arrivalNotification)

    const delayedFlightNotification = FlightStatusNotifications
      .buildDelayedFlightNotification(toName, to)
    Trello.client().addCommentToCard(flightCardId, delayedFlightNotification)

    let flightPendingNotification = FlightStatusNotifications
      .buildFlightPendingNotification(fromName, from, toName, to, flightNumber, airlineName, departure, arrival)
    if (isMultipleSegments && isFirstSegment) {
      const flightPlanNotification = FlightStatusNotifications.buildFlightPlanNotification(flightSegments)
      flightPendingNotification = `${flightPlanNotification} ${flightPendingNotification}`
    }
    Trello.client().addCommentToCard(flightCardId, flightPendingNotification)
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
    const { isLoadingBoards, isLoadingCards, newFlightCard } = this.state

    return (
      <div >
        {isLoadingBoards ? <span>Loading...</span> : <Form defaultValues={{ board: this.getDefaultBoardId(), flightSegments: [{}] }}
          onSubmit={this.saveFlightSegments} >
          {formApi => (
            <form id="boardsForm">
              <Row>
                <Col xs={3}>
                  <Select field="board"
                    className="form-control"
                    id="select-input-board"
                    onChange={this.onBoardChange}
                    options={this.getActiveBoards().map(board => ({ label: board.name, value: board.id }))} />
                </Col>
                <Col xs={1}>
                  <Button bsStyle="success" onClick={() => this.addFlightRow(formApi)}>+ Flight segment</Button>
                </Col>
              </Row>

              <div className="addFlightRows">
                <Row>
                  <Col xs={2}>Departure date</Col>
                  <Col xs={1}>From</Col>
                  <Col xs={1}>To</Col>
                  <Col xs={1}>Departure</Col>
                  <Col xs={1}>Arrival</Col>
                  <Col xs={2}>Flight no.</Col>
                  <Col xs={2}>Reservation</Col>
                </Row>
              </div>

              {isLoadingCards ? <div>Loading cards...</div> : (<Fragment>
                {newFlightCard && formApi.values.flightSegments.map((_element, i) =>
                  <NestedField key={`flightSegments${i}`}
                    field={['flightSegments', i]}
                    formApi={formApi}
                    component={NewFlightSegmentForm} />)}
                <Button bsStyle="primary" onClick={formApi.submitForm}>Save</Button>
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
