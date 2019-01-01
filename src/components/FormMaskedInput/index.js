import React, { Component } from 'react'
import MaskedInput from 'react-text-mask'
import { Field } from 'react-form'

export default class FormMaskedInput extends Component {
  render() {
    const { field } = this.props

    return (
      <Field field={field}>
        {fieldApi => {
          // Remember to pull off everything you dont want ending up on the <input>
          // thats why we pull off onChange, onBlur, and field
          // Note, the ...rest is important because it allows you to pass any
          // additional fields to the internal <input>.
          const { onChange, onBlur, ...rest } = this.props
          const { setValue, setTouched } = fieldApi

          return (
            <MaskedInput
              {...rest}
              onChange={e => {
                const { value } = e.target
                setValue(value)
                if (onChange) {
                  onChange(value)
                }
              }}
              onBlur={() => {
                setTouched()
                if (onBlur) {
                  onBlur()
                }
              }}
            />
          )
        }}
      </Field>
    )
  }
}
