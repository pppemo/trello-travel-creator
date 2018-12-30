import React, { Component } from 'react'
import { Field } from 'react-form'
import { SingleDatePicker } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'

export default class FormDatePicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDatePicker: false,
      date: null
    }
  }

  render() {
    const { field } = this.props

    // passing state as I want to rerender Field on every state change.
    return (
      <Field field={field} state={this.state}>
        {fieldApi => {
          // Remember to pull off everything you dont want ending up on the <input>
          // thats why we pull off onChange, onBlur, and field
          // Note, the ...rest is important because it allows you to pass any
          // additional fields to the internal <input>.
          const { onChange, onBlur, field, index, saveFormat, ...rest } = this.props
          const { showDatePicker, date } = this.state
          const { setValue, setTouched } = fieldApi

          return (
            <SingleDatePicker
              {...rest}
              date={date}
              onDateChange={date => {
                setValue(date.format(saveFormat))
                if (onChange) {
                  onChange(date)
                }
                this.setState({ date })
              }}
              focused={showDatePicker}
              onFocusChange={({ focused }) => {
                if (!focused) {
                  setTouched()
                }
                this.setState({ showDatePicker: focused })
              }}
              id={`${field}${index}`}
            />
          )
        }}
      </Field>
    )
  }
}
