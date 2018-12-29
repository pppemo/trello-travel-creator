import React, { Component } from 'react'
import { Text } from 'react-form'
import { Row, Col } from 'react-bootstrap'
import { SingleDatePicker } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'

class index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDatePicker: false,
      takeOffDate: null
    }
  }

  render() {
    return (
      <Row>
        <Col xs={2}>
          <SingleDatePicker
            date={this.state.takeOffDate}
            onDateChange={date => this.setState({ takeOffDate: date })}
            focused={this.state.showDatePicker}
            onFocusChange={({ focused }) => this.setState({ showDatePicker: focused })}
            id="takeOffDate"
            firstDayOfWeek={1}
            numberOfMonths={1}
            displayFormat="DD/MM/YYYY"
            placeholder="Flight date"
          />
        </Col>
        <Col xs={2}><Text className="form-control" field="from" placeholder="From" /></Col>
        <Col xs={2}><Text className="form-control" field="to" placeholder="To" /></Col>
        <Col xs={2}><Text className="form-control" field="airlineIcao" placeholder="Airline ICAO" /></Col>
        <Col xs={2}><Text className="form-control" field="flightNumber" placeholder="Flight no." /></Col>
        <Col xs={2}><Text className="form-control" field="res" placeholder="Res. number" /></Col>
      </Row>
    );
  }
}

export default index
