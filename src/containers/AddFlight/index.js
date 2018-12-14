import React, { Component, Fragment } from 'react'
import Trello from './../../api/trello'
import NewFlightSegmentForm from './../../components/NewFlightSegmentForm'
import { Form, Select, NestedField } from 'react-form'

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

  saveFlightSegments = form => {
    const { idBoard: parentBoardId, id: idCardSource } = this.state.newFlightCard
    const { flightSegments } = form
    const options = {
      idCardSource,
      pos: 'bottom'
    }

    this.fetchLists(parentBoardId).then(response => {
      const upcomingFlightsList = response.find(list => list.name === UPCOMING_FLIGHTS_LIST_NAME)
      if (upcomingFlightsList) {
        flightSegments.forEach(flightSegment => {
          const { from, to, resNumber } = flightSegment
          const cardName = `${from} ${to}`
          this.createNewFlightSegmentCard(cardName, resNumber, options, upcomingFlightsList.id)
        })
      } else {
        throw new Error(`There's no list named "${UPCOMING_FLIGHTS_LIST_NAME}"`)
      }
    }).catch(error => {
      alert(error)
    })
  }

  createNewFlightSegmentCard = (cardName, resNumber, options, upcomingFlightsListId) => {
        return Trello.client().addCardWithExtraParams(cardName, options, upcomingFlightsListId)
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

  addFlightRow = formApi => formApi.setValue('flightSegments', formApi.values.flightSegment.concat({}))

  render() {
    const { isLoadingBoards, isLoadingCards, newFlightCard } = this.state

    return (
      <div>
        <h1>Adding flight</h1>
        {isLoadingBoards ? <span>Loading...</span> : <Form defaultValues={{ board: this.getDefaultBoardId(), flightSegment: [{}] }}
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
                  {formApi.values.flightSegment.map((_element, i) =>
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

export default AddFlight
