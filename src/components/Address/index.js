import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, {useState} from 'react'
import InputWrapper from '../InputWrapper'
import Input from '../Input'
import InputSubfieldWrapper from '../InputSubfieldWrapper'
import countryList from "react-select-country-list"

const Address = ({ errors, fieldData, name,  register, value, fieldHidden, handleFieldChange, onChange, customCountryList, ...wrapProps }) => {
    
    const {
        cssClass,
        inputMaskValue,
        isRequired,
        maxLength,
        placeholder,
        size,
        inputs,
    } = fieldData
    
    const [ countries ] = useState(customCountryList || countryList().getData())
    const countryOptions = countries.map(country => {
        return <option value={country.value} key={country.value} defaultValue="US">{country.label}</option>
      })
    const [ select, setSelected ] = useState('')

    let renderedSubfields = []

    inputs.forEach(i => {
        if (!i.isHidden) {
            if (!i.inputType) { // text field
                //console.log(i)

                const widefields = [
                    'Street Address',
                    'Address Line 2'
                ]
                const subfieldClass = (widefields.indexOf(i.label) > -1) ? '' : 'half-width'
                // so we need to render this as a subfield inside of Name

                // set this up to pass to <Input> as fieldData
                i.subfieldData = {
                    'cssClass': classnames(
                        subfieldClass,
                        cssClass,
                    ),
                    'inputMaskValue': inputMaskValue,
                    'isRequired': !fieldHidden ? isRequired : false,
                    'maxLength': maxLength,
                    'placeholder': placeholder,
                    'size': size,
                    'label': i.label,
                    'id': i.id,
                    'type': 'text',
        
                }
                i.register = register
                renderedSubfields.push(i)
            }
        }
       
    }) 

    const inputFields = renderedSubfields.map(subfield => {

        const isCountryInput = subfield?.label === 'Country' ? true : false
        
        const handleBothOnChangeCalls = (e) => {
            setSelected(e.target.value)
            const id = Number(e.target.name.slice(6))
            handleFieldChange(id, e.target.value)
        }
        const inputName = typeof subfield.id === "string" ? `input_${subfield.id.replace(".", "_")}` : `input_${subfield.id.toString().replace(".", "_")}`


        if(isCountryInput){
            return (
                <InputSubfieldWrapper
                    errors={errors}
                    inputData={subfield.subfieldData}
                    labelFor={subfield.label}
                    fieldHidden={fieldHidden}
                    key={subfield.label}
                > 
                    <select 
                        name={typeof subfield.id === "string" ? `input_${subfield.id.replace(".", "_")}` : `input_${subfield.id.toString().replace(".", "_")}`}
                        /*onChange={e => updateOnChangeValues(e)}*/
                        onBlur={(e) => handleBothOnChangeCalls(e)} 
                        defaultValue="US"
                        ref={register({
                        })}
                        >
                        {countryOptions}
                    </select>
                </InputSubfieldWrapper>
            )
        } else{
            return (<Input subfield
                errors={errors[inputName]}
                fieldData={subfield.subfieldData}
                key={subfield.id}
                name={subfield.label}
                register={subfield.register}
                fieldHidden={fieldHidden}
            />)
        }
        
        
    })
return (
    <InputWrapper
            errors={errors}
            inputData={fieldData}
            labelFor={name}
            {...wrapProps}
            fieldHidden={fieldHidden}
        >{inputFields}</InputWrapper>
)
}

export default Address

Address.propTypes = {
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