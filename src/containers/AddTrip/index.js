import React, { Component, Fragment } from 'react'
import Trello from './../../api/trello'
import NewFlightSegmentForm from './../../components/NewFlightSegmentForm'
import FlightStatusNotifications from './../../notifications/flightStatusNotifications'
import { Form, Select, NestedField } from 'react-form'

const PREFERRED_BOARD_NAME = 'Aviation'
const CHECKLISTS_LIST_NAME = 'CHECKLISTS'
const UPCOMING_FLIGHTS_LIST_NAME = 'Upcoming flights'
const NEW_FLIGHT_CARD_NAME = 'New flight'

class AddTrip extends Component {
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

  saveFlightSegments = form => {
    const { newFlightCard } = this.state
    const { flightSegments } = form

    this.fetchLists(newFlightCard.idBoard).then(response => {
      const upcomingFlightsList = response.find(list => list.name === UPCOMING_FLIGHTS_LIST_NAME)
      if (upcomingFlightsList) {
        flightSegments.forEach(flightSegment => {
          this.createNewFlightSegmentCard(flightSegment, newFlightCard, upcomingFlightsList.id)
        })
      } else {
        throw new Error(`There's no list named "${UPCOMING_FLIGHTS_LIST_NAME}"`)
      }
    }).catch(error => {
      alert(error)
    })
  }

  createNewFlightSegmentCard = (flightSegment, newFlightCard, upcomingFlightsListId) => {
    const { date, airlineIcao, flightNumber, from, to, res } = flightSegment
    const desc = newFlightCard.desc.replace('{reservation_number}', res)
    const cardName = `${date} ${airlineIcao} ${flightNumber} ${from}->${to}`
    const options = {
      idCardSource: newFlightCard.id,
      pos: 'bottom',
      desc
    }

    Trello.client().addCardWithExtraParams(cardName, options, upcomingFlightsListId)
      .then(card => this.addFlightStatusNotifications(card.id, from, to, flightNumber))
  }

  addFlightStatusNotifications = (flightCardId, fromIata, toIata, flightNumber) => {
    const airports = require('airport-data')
    const airportFrom = airports.find(airport => airport.iata === fromIata)
    const airportTo = airports.find(airport => airport.iata === toIata)

    const airportFromName = airportFrom ? airportFrom.city : ''
    const airportToName = airportTo ? airportTo.city : ''

    const arrivalNotification = FlightStatusNotifications
      .buildArrivalNotification(airportToName, toIata)
    Trello.client().addCommentToCard(flightCardId, arrivalNotification)

    const delayedFlightNotification = FlightStatusNotifications
      .buildDelayedFlightNotification(airportToName, toIata)
    Trello.client().addCommentToCard(flightCardId, delayedFlightNotification)

    const flightPendingNotification = FlightStatusNotifications
      .buildFlightPendingNotification(airportFromName, fromIata, airportToName, toIata, flightNumber)
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
      <div>
        <h1>Adding flight</h1>
        {isLoadingBoards ? <span>Loading...</span> : <Form defaultValues={{ board: this.getDefaultBoardId(), flightSegments: [{}] }}
          onSubmit={this.saveFlightSegments} >
          {formApi => (
            <form id="boardsForm" >
              <label htmlFor="board">Board:</label>
              <Select field="board"
                id="select-input-board"
                onChange={this.onBoardChange}
                options={this.getActiveBoards().map(board => ({ label: board.name, value: board.id }))} />

              {isLoadingCards ? <div>Loading cards...</div> : (
                newFlightCard && <Fragment>
                  {formApi.values.flightSegments.map((_element, i) =>
                    <NestedField key={`flightSegments${i}`} field={['flightSegments', i]} component={NewFlightSegmentForm} />)}
                  <button onClick={() => this.addFlightRow(formApi)} >Add flight segment</button>
                  <button onClick={formApi.submitForm} >Save</button>
                </Fragment>
              )
              }
            </form>
          )}
        </Form>}
      </div>
    );
  }
}

export default AddTrip
