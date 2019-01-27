import React, { Component } from 'react'
import { Text, Checkbox, Select } from 'react-form'
import { Row, Col, Button } from 'react-bootstrap'
import FormDatePicker from './../FormDatePicker'
import FormMaskedInput from './../FormMaskedInput'
import FontAwesome from 'react-fontawesome'
import Airlines from './../../databases/airlines.json'
import Airports from 'airport-data/airports'
import Timezones from 'google-timezones-json'
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
    const flightNumber = e.target.value.toUpperCase()
    const airlineName = this.getAirlineNameByFlightNumber(flightNumber)
    formApi.setValue(`flightSegments[${rowIndex}].airlineName`, airlineName)
  }

  fetchAirportName = (e, fieldPrefix) => {
    const { field, formApi } = this.props
    const rowIndex = field[1]
    const airportIataCode = e.target.value.toUpperCase()
    const airport = Airports.find(airport => airport.iata === airportIataCode)
    const airportCityName = airport ? airport.city : ''
    const airportCityTimezone = airport ? airport.tz : null
    formApi.setValue(`flightSegments[${rowIndex}].${fieldPrefix}Name`, airportCityName)
    formApi.setValue(`flightSegments[${rowIndex}].${fieldPrefix}Timezone`, airportCityTimezone)
  }

  removeRow = () => {
    const { field, formApi } = this.props
    const rowIndex = field[1]
    formApi.removeValue('flightSegments', rowIndex)
  }

  getTimezoneSelectorOptions = () =>
    Object.keys(Timezones).map(timezone => ({
      label: Timezones[timezone],
      value: timezone
    }))

  render() {
    const { field } = this.props
    const index = field[1]

    return (
      <div className="NewFlightSegmentForm-Leg">
        <Row className="NewFlightSegmentForm-Row">
          <Col xs={1}><FormDatePicker
            field="takeOffDate"
            index={index}
            firstDayOfWeek={1}
            numberOfMonths={1}
            displayFormat="DD/MM/YYYY"
            saveFormat="YYMMDD"
            placeholder="DD/MM/YYYY"
            hideKeyboardShortcutsPanel={true}
          /></Col>
          <Col xs={1}><Text className="form-control" field="fromIata"
            placeholder="ABC" maxLength={3} style={{textTransform: 'uppercase'}} onBlur={e => this.fetchAirportName(e, 'from')} /></Col>
          <Col xs={1}><Text className="form-control" field="toIata"
            placeholder="XYZ" maxLength={3} style={{textTransform: 'uppercase'}} onBlur={e => this.fetchAirportName(e, 'to')} /></Col>
          <Col xs={1}>
            <Checkbox field="destinationOutsideEU" className="form-control" />
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
          <Col xs={1}>
            <Text className="form-control"
              field="flightNumber"
              placeholder="XY1234"
              style={{textTransform: 'uppercase'}}
              onBlur={this.fetchAirlineName}
            />
          </Col>
          <Col xs={1}><Text className="form-control" field="res" placeholder="ABCDEF" style={{textTransform: 'uppercase'}} /></Col>
          <Col xs={1}>{index > 0 && <Button bsStyle="danger" onClick={this.removeRow}><FontAwesome name="trash" /></Button>}</Col>
        </Row>
        <Row className="NewFlightSegmentForm-Row">
          <Col xs={1} xsOffset={1}><Text className="form-control NewFlightSegmentForm-SuggestionField" field="fromName" placeholder="City" /></Col>
          <Col xs={1}><Text className="form-control NewFlightSegmentForm-SuggestionField" field="toName" placeholder="City" /></Col>
          <Col xs={1} xsOffset={1}><Select field="fromTimezone" className="form-control NewFlightSegmentForm-SuggestionField" options={this.getTimezoneSelectorOptions()} /></Col>
          <Col xs={1}><Select field="toTimezone" className="form-control NewFlightSegmentForm-SuggestionField" options={this.getTimezoneSelectorOptions()} /></Col>
          <Col xs={2}><Text className="form-control NewFlightSegmentForm-SuggestionField" field="airlineName" placeholder="Airline" /></Col>
        </Row>
      </div>
    );
  }
}
