import React, { Component } from 'react'
import { Row, Col, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import './NewTripChecklistItem.css'

export default class NewTripChecklistItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isRowActive: false
    }
  }

  enableCardForCreation = (value, index, formApi) => {
    const isRowActive = !!value[0]
    formApi.setValue(`tripChecklistItems[${index}].enabled`, isRowActive)
    this.setState({ isRowActive })
  }

  modifyMembers = (value, index, formApi) => formApi.setValue(`tripChecklistItems[${index}].members`, value)

  switchCardCreationMode = (value, index, formApi) => formApi.setValue(`tripChecklistItems[${index}].cardForEachMember`, !!value[0])

  render() {
    const { formApi, item, boardMembers, field } = this.props
    const index = field[1]
    const { name } = item
    const { isRowActive } = this.state

    return (
      <Row className={classNames('NewTripChecklistItem-Row', { active: isRowActive })}>
        <Col xs={1}>
          <ToggleButtonGroup type="checkbox" onChange={value => this.enableCardForCreation(value, index, formApi)}>
            <ToggleButton bsStyle="info" value={true}>Create</ToggleButton>
          </ToggleButtonGroup>
        </Col>
        <Col xs={5}><b>{name}</b></Col>
        <Col xs={6}>
          <ToggleButtonGroup type="checkbox" onChange={value => this.switchCardCreationMode(value, index, formApi)}>
              <ToggleButton bsStyle="info" value={true}><FontAwesome name="share-alt" /></ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup type="checkbox" onChange={value => this.modifyMembers(value, index, formApi)}>
            {boardMembers.map(boardMember =>
              <ToggleButton key={boardMember.id} value={boardMember.id}>{boardMember.fullName}</ToggleButton>)}
          </ToggleButtonGroup>
        </Col>
      </Row>
    );
  }
}
