import React, { Component } from 'react'
import Trello from './../../api/trello'
import { Form, Select } from 'react-form'

const PREFERRED_BOARD_NAME = 'Aviation'
const CHECKLISTS_LIST_NAME = 'CHECKLISTS'
const NEW_FLIGHT_CARD_NAME = 'New flight'

class AddFlight extends Component {
  constructor(params) {
    super(params);
    this.state = {
      isLoadingBoards: true,
      isLoadingCards: false,
      numberOfFlights: 1,
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
        throw new Error(`There's no list named "${CHECKLISTS_LIST_NAME}"`)
      }
    }).then(response => {
      const newFlightCard = response.find(card => card.name === NEW_FLIGHT_CARD_NAME)
      if (newFlightCard) {
        this.setState({ newFlightCard })
      } else {
        throw new Error(`There's no card named "${NEW_FLIGHT_CARD_NAME}"`)
      }
    }).catch(error => {
      this.setState({ isLoadingCards: false })
      alert(error)
    })
  }

  render() {
    const { isLoadingBoards, isLoadingCards } = this.state

    return (
      <div>
        <h1>Adding flight</h1>
        {isLoadingBoards ? <span>Loading...</span> : <Form defaultValues={{ board: this.getDefaultBoardId() }}>
          {() => (
            <form id="boardsForm" >
              <label htmlFor="board">Board:</label>
              <Select field="board"
                id="select-input-board"
                onChange={this.onBoardChange}
                options={this.getActiveBoards().map(board => ({ label: board.name, value: board.id }))} />
            </form>
          )}
        </Form>}
      </div>
    );
  }
}

export default AddFlight
