import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import InputWrapper from '../../components/InputWrapper'

const Select = ({ errors, fieldData, name, handleFieldChange, onChange, setValue, register, options, ...wrapProps }) => {
    const { choices, cssClass, isRequired, size, placeholder } = fieldData
    
    const handleBothOnChangeCalls = (e) => {
        //onChange(fieldData, value, choiceID)
        const id = Number(e.target.name.slice(6))
        handleFieldChange(id, e.target.value)
    }

    //check for options form what we do template
    let selectChoices
    let newChoices = []
    
    if (options && options.length > 0 && cssClass === "populate_dynamically"){
        options.forEach(option => newChoices.push({"text":option.options, "value": option.options, "isSelected": false, price: ""}))
        selectChoices = newChoices
    } else{
        selectChoices = typeof choices === "string" ? JSON.parse(choices) : JSON.parse(JSON.stringify(choices))
    }
    if(placeholder && placeholder.length > 0){
        selectChoices.unshift({"text":placeholder, "value": placeholder, "isSelected": true, price: ""})
    }
    
    //get param from query, if fieldValue is expecting a query param
    const fieldValue = fieldData.inputName ? fieldData.inputName : null //if it's a hidden field, the parameter value is stored under inputName
    const paramToCheck = fieldValue && fieldValue !== '' ? fieldValue : null
    const queryToCheck = typeof document !== "undefined" ? new URLSearchParams(document.location.search.substring(1)): null;
    const param = paramToCheck && queryToCheck ? queryToCheck.get(paramToCheck) : null;

    //if param exists or a choice isSelected, setValue
    useEffect(() => {
        if (param){
            setValue(name, param, { shouldDirty: true, })
            const id = Number(name.slice(6))
            handleFieldChange(id, param)
        } else if (!param && selectChoices && selectChoices.length > 0){
            selectChoices.forEach(({ isSelected, value }) => {
                if(isSelected){
                    setValue(name, value, { shouldDirty: true })
                    const id = Number(name.slice(6))
                    handleFieldChange(id, value)
                }
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [param, name, setValue]);

    return (
            <InputWrapper
            errors={errors}
            inputData={fieldData}
            labelFor={name}
            {...wrapProps}
        >
            <select
                aria-invalid={errors}
                aria-required={isRequired}
                //TODO: GF uses select2 library and classes, need to figure out how to handle here if we're mimicing their functionality
                className={classnames(
                    'gravityform__field__input',
                    'gravityform__field__input__select',
                    'gfield_select',
                    cssClass,
                    size
                )}
                id={name}
                name={name}
                onChange={(e) => handleBothOnChangeCalls(e)}
                ref={register({
                    required: isRequired && 'This field is required',
                    validate: {
                        validOption: (value) => isRequired && !param ? value !== placeholder : true,
                    },
                })}
            >
                {selectChoices.map(({ text, value }, index) => {
                    return (
                        <option
                            key={`${name}-${index}`}
                            value={value}
                        >
                            {text}
                        </option>
                    )
                })}
            </select>
        </InputWrapper>
    )
}

export default Select

Select.propTypes = {
    errors: PropTypes.object,
    fieldData: PropTypes.shape({
        choices: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
          ]),
        cssClass: PropTypes.string,
        isRequired: PropTypes.bool,
        size: PropTypes.string,
    }),
    name: PropTypes.string,
    register: PropTypes.func,
    wrapProps: PropTypes.object,
}