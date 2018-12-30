import React, { Component } from 'react'
import { Text } from 'react-form'
import { Row, Col } from 'react-bootstrap'
import FormDatePicker from './../FormDatePicker'

export default class NewFlightSegmentForm extends Component {
  render() {
    const { field } = this.props
    const index = field[1]

    return (
      <Row>
        <Col xs={2}><FormDatePicker
          field="takeOffDate"
          index={index}
          firstDayOfWeek={1}
          numberOfMonths={1}
          displayFormat="DD/MM/YYYY"
          saveFormat="YYMMDD"
          placeholder="Flight date"
          hideKeyboardShortcutsPanel={true}
        /></Col>
        <Col xs={2}><Text className="form-control" field="from" placeholder="From" /></Col>
        <Col xs={2}><Text className="form-control" field="to" placeholder="To" /></Col>
        <Col xs={2}><Text className="form-control" field="airlineIcao" placeholder="Airline ICAO" /></Col>
        <Col xs={2}><Text className="form-control" field="flightNumber" placeholder="Flight no." /></Col>
        <Col xs={2}><Text className="form-control" field="res" placeholder="Res. number" /></Col>
      </Row>
    );
  }
}
