import React, { Component } from 'react'
import { Text } from 'react-form'
class index extends Component {
  render() {
    return (
      <div>
        <span><Text field="date" placeholder="Flight date" /></span>
        <span><Text field="from" placeholder="From" /></span>
        <span><Text field="to" placeholder="To" /></span>
        <span><Text field="res" placeholder="Res. number" /></span>
      </div>
    );
  }
}

export default index
