import React, { Component } from 'react'
import { Text, Checkbox } from 'react-form'
import { Row, Col, Button } from 'react-bootstrap'
import FormDatePicker from './../FormDatePicker'
import FormMaskedInput from './../FormMaskedInput'
import Airlines from './../../databases/airlines.json'
import './NewFlightSegmentForm.css'

export default class NewFlightSegmentForm extends Component {
  getAirlineNameByFlightNumber = flightNumber => {
    const airlineIATACode = flightNumber.substr(0, 2)
    const airline = Airlines.find(airline => airline.iata === airlineIATACode)
    return airline ? airline.name : null
  }

  fetchAirlineName = e => {
    const { field, formApi } = this.props
    const rowIndex = field[1]
    const flightNumber = e.target.value
    const airlineName = this.getAirlineNameByFlightNumber(flightNumber)
    formApi.setValue(`flightSegments[${rowIndex}].airlineName`, airlineName)
  }

  render() {
    const { field } = this.props
    const index = field[1]

    return (
      <Row className="NewFlightSegmentForm-Row">
        <Col xs={2}><FormDatePicker
          field="takeOffDate"
          index={index}
          firstDayOfWeek={1}
          numberOfMonths={1}
          displayFormat="DD/MM/YYYY"
          saveFormat="YYMMDD"
          placeholder="DD/MM/YYY"
          hideKeyboardShortcutsPanel={true}
        /></Col>
        <Col xs={2}>
          <Text className="form-control" field="from" placeholder="ABC" />
          <Text className="form-control" field="to" placeholder="XYZ" />
        </Col>
        <Col xs={1}>
          <Checkbox field="destinationOutsideEU" className="form-control"/>
        </Col>
        <Col xs={1}>
          <FormMaskedInput
            mask={[/\d/, /\d/, ':', /\d/, /\d/]}
            className="form-control"
            field="departure"
            placeholder="HH:MM"
            guide={false}
          />
        </Col>
        <Col xs={1}>
          <FormMaskedInput
            mask={[/\d/, /\d/, ':', /\d/, /\d/]}
            className="form-control"
            field="arrival"
            placeholder="HH:MM"
            guide={false}
          /></Col>
        <Col xs={2}>
          <Text className="form-control"
            field="flightNumber"
            placeholder="XY1234"
            onBlur={this.fetchAirlineName}
          />
          <Text className="form-control" field="airlineName" placeholder="LOT" />
        </Col>
        <Col xs={2}><Text className="form-control" field="res" placeholder="ABCDEF" /></Col>
        <Col xs={1}><Button bsStyle="danger">X</Button></Col>
      </Row>
    );
  }
}
