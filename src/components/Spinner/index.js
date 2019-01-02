import React from 'react'
import { GridLoader } from 'react-spinners'
import './Spinner.css'

const Spinner = () => (
  <div className="Spinner">
    <GridLoader
      sizeUnit={"px"}
      size={10}
      color={'#4A90E2'}
    />
  </div>)

export default Spinner
