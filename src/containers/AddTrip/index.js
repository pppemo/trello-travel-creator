import React, { Component } from 'react'
import Trello from './../../api/trello'
import NewTripChecklistItem from './../../components/NewTripChecklistItem'
import IntegrationsNotifications from './../../components/IntegrationsNotifications'
import { Form, Select, NestedField, Text } from 'react-form'
import { Button, Row, Col, ButtonToolbar } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import './AddTrip.css'
import Spinner from './../../components/Spinner'
import { PulseLoader } from 'react-spinners'

const PREFERRED_BOARD_NAME = 'Podróże'
const CHECKLISTS_LIST_NAME = 'TEMPLATE CARDS'
const BACKLOG_LIST_NAME = 'Backlog'
const NEW_TRIP_CARD_NAME = 'New trip'
const TRIPS_LIST_NAME = 'TRIPS'

//TODO Handling expired token
//TODO Handling 400 responses

class AddTrip extends Component {
  constructor(params) {
    super(params);
    this.state = {
      isLoadingBoards: true,
      isLoadingCards: false,
      isSaving: false,
      boards: [],
      checklistCards: [],
      boardMembers: [],
      labelsColors: []
    }
  }

  componentDidMount() {
    Trello.client().getBoards('me')
      .then(boards => this.setState({
        boards,
        isLoadingBoards: false,
        labelsColors: this.parseLabelsColors(boards)
      }, () => {
        const defaultBoardId = this.getDefaultBoardId()
        if (defaultBoardId) {
          this.onBoardChange(defaultBoardId)
        }
      }))
      .catch(error => console.log(error))
  }

  parseLabelsColors = boards => boards ? Object.keys(boards[0].labelNames) : []

  getActiveBoards = () => this.state.boards.filter(board => !board.closed)

  fetchLists = boardId => Trello.client().getListsOnBoard(boardId)

  fetchCards = listId => Trello.client().getCardsOnList(listId)

  getBoardMembers = boardId => Trello.client().getBoardMembers(boardId)

  saveTrip = form => {
    const { board, tripChecklistItems, labelColor, tripName } = form
    this.setState({ isSaving: true })
    let tripLabelId

    Trello.client().addLabelOnBoard(board, tripName, labelColor)
      .then(response => {
        tripLabelId = response.id

        return this.fetchLists(board)
      })
      .then(response => {
        const backlogList = response.find(list => list.name === BACKLOG_LIST_NAME)
        const tripsList = response.find(list => list.name === TRIPS_LIST_NAME)
        if (backlogList) {
          const cardsPromises = []

          tripChecklistItems
            .filter(item => item.enabled)
            .forEach(item => {
              const cardOptions = {
                idCardSource: item.id,
                pos: 'bottom',
                idLabels: tripLabelId,
                keepFromSource: 'attachments,checklists,comments,due,stickers'
              }

              if (item.name === NEW_TRIP_CARD_NAME) {
                cardsPromises.push(Trello.client().addCardWithExtraParams(tripName, {
                  ...cardOptions,
                  pos: 'top'
                }, tripsList.id))
                return
              }

              if (item.cardForEachMember) {
                item.members.forEach(memberId => {
                  cardsPromises.push(Trello.client().addCardWithExtraParams(item.name, {
                    ...cardOptions,
                    idMembers: memberId
                  }, backlogList.id))
                })
              } else {
                cardsPromises.push(Trello.client().addCardWithExtraParams(item.name, {
                  ...cardOptions,
                  idMembers: item.members.join(',')
                }, backlogList.id))
              }
            })

          return Promise.all(cardsPromises)
        } else {
          throw new Error(`There's no list named "${BACKLOG_LIST_NAME}"`)
        }
      }).then(() => alert('Done!'))
      .catch(error => {
        alert(error)
      }).finally(() => this.setState({ isSaving: false }))
  }

  getDefaultBoardId = () => {
    const defaultBoard = this.getActiveBoards().find(board => board.name === PREFERRED_BOARD_NAME)
    return defaultBoard ? defaultBoard.id : undefined
  }

  onBoardChange = boardId => {
    this.setState({
      isLoadingCards: true,
      checklistCards: [],
      boardMembers: []
    })
    this.fetchLists(boardId).then(response => {
      const checklistsList = response.find(list => list.name === CHECKLISTS_LIST_NAME)
      if (checklistsList) {
        return this.fetchCards(checklistsList.id)
      } else {
        this.setState({ newFlightCard: null })
        throw new Error(`There's no list named "${CHECKLISTS_LIST_NAME}"`)
      }
    }).then(trelloCards => {
      const checklistCards = trelloCards.map(card => ({
        name: card.name,
        id: card.id
      }))
      this.setState({ checklistCards })
      return this.getBoardMembers(boardId)
    }).then(boardMembers => {
      this.setState({ boardMembers })
    }).catch(error => {
      alert(error)
    }).finally(() => this.setState({ isLoadingCards: false }))
  }

  shouldShowTable = () => {
    const { isLoadingBoards, isLoadingCards, checklistCards } = this.state
    return !isLoadingBoards && !isLoadingCards && checklistCards && checklistCards.length > 0
  }

  render() {
    const { checklistCards, isSaving, boardMembers, labelsColors } = this.state
    return (
      <div>
        <IntegrationsNotifications />
        {!this.shouldShowTable() ? <Spinner /> : <Form
          defaultValues={{ board: this.getDefaultBoardId(), tripChecklistItems: checklistCards }}
          onSubmit={this.saveTrip} >
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
                <Col xs={3}>
                  <Text className="form-control"
                    field="tripName"
                    placeholder="Trip name"
                  />
                </Col>
                <Col xs={1}>
                  <Select field="labelColor"
                    className="form-control"
                    id="select-input-label-color"
                    options={labelsColors.map(color => ({ label: color, value: color }))} />
                </Col>
                <Col xs={5}>
                  <ButtonToolbar>
                    <Button bsStyle="danger"
                      onClick={() => formApi.setValue('flightSegments', [])}><FontAwesome name="trash" /> Clear</Button>
                    <Button bsStyle="primary" onClick={formApi.submitForm} disabled={isSaving}>Create trip</Button>
                    {isSaving && <PulseLoader color="#337ab7" className="AddTrip-savingSpinner" />}
                  </ButtonToolbar>
                </Col>
              </Row>

              <div className="addFlightRows">
                <Row>
                  <Col xs={1}></Col>
                  <Col xs={5}>Card name</Col>
                  <Col xs={6}>Members</Col>
                </Row>
              </div>

              {checklistCards.map((item, i) =>
                <NestedField key={`tripChecklistItems${i}`}
                  field={['tripChecklistItems', i]}
                  item={item}
                  boardMembers={boardMembers}
                  formApi={formApi}
                  component={NewTripChecklistItem} />)}
            </form>
          )}
        </Form>}
      </div>
    );
  }
}

export default AddTrip
