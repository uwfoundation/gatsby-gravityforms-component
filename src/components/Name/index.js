import classnames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import InputWrapper from '../InputWrapper'
import Input from '../Input'

const Name = ({ errors, fieldData, name, register, value, ...wrapProps }) => {
    //console.log('name', fieldData, name, value)
    //console.log(inputs)
    //console.log(value)
    //console.log(register)
    const {
        cssClass,
        inputMaskValue,
        isRequired,
        maxLength,
        placeholder,
        size,
        inputs,
    } = fieldData

    let renderedSubfields = []

    inputs.forEach(i => {
        if (!i.isHidden) {
            if (!i.inputType || i.subfieldData) { // text field //not sure if this check is still needed??
                //console.log(i)
                // so we need to render this as a subfield inside of Name

                // set this up to pass to <Input> as fieldData
                i.subfieldData = {
                    'cssClass': classnames(
                        'half-width',
                        cssClass,
                    ),
                    'inputMaskValue': inputMaskValue,
                    'isRequired': isRequired,
                    'maxLength': maxLength,
                    'placeholder': placeholder,
                    'size': size,
                    'label': i.label,
                    'id': i.id.toString(),
                    'type': 'text',
        
                }
                i.register = register
                i.id = i.id.toString()
                renderedSubfields.push(i)
            }
        }
       
    }) 

    //console.log(renderedSubfields)

    const inputFields = renderedSubfields.map(subfield => {
                    
        const inputName = `input_${subfield.id.replace(".", "_")}`
        
        return (<Input subfield
            errors={errors[inputName]}
            fieldData={subfield.subfieldData}
            key={subfield.id}
            name={inputName}
            register={subfield.register}
            //value={value}
            fromNameField
        />)
    })
return (
    <InputWrapper
            errors={errors}
            inputData={fieldData}
            labelFor={name}
            {...wrapProps}
        >{inputFields}</InputWrapper>
)
}

export default Name

Name.propTypes = {
    errors: PropTypes.object,
    fieldData: PropTypes.shape({
        cssClass: PropTypes.string,
        inputMaskValue: PropTypes.string,
        maxLength: PropTypes.number,
        placeholder: PropTypes.string,
        isRequired: PropTypes.bool,
        type: PropTypes.string,
        size: PropTypes.string,
    }),
    name: PropTypes.string,
    register: PropTypes.func,
    value: PropTypes.string,
    wrapProps: PropTypes.object,
}