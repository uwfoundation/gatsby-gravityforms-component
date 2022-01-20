import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useLayoutEffect, useEffect } from 'react'
import ReactHtmlParser from 'react-html-parser'
import strings from '../../utils/strings'
import InputWrapper from '../InputWrapper'

// TODO: Enable Select All Choice
const SelectorList = ({ errors, fieldData, name, register, onChange, handleFieldChange, fieldHidden, ...wrapProps }) => {
    const { choices, cssClass, isRequired, size, type } = fieldData
    const options = typeof choices === "string" ? JSON.parse(choices) : JSON.parse(JSON.stringify(choices))

    const prev = useRef();
    useEffect(() => {
        prev.current = fieldHidden
    });

    const fieldHiddenClass = fieldHidden === true ? 'gform_hidden' : ''

    const handleBothOnChangeCalls = (fieldData, value, choiceID) => {
        if(typeof choiceID === 'string' && choiceID.includes('.')){
            choiceID = choiceID.replace('.', '')
        }
        onChange(fieldData, value, choiceID)
        handleFieldChange(fieldData, value, choiceID)
    }
    const firstUpdate = useRef(true);
    useLayoutEffect(() => {
        if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
        }
    });

    return (
        <InputWrapper
            errors={errors}
            inputData={fieldData}
            labelFor={name}
            fieldHidden={fieldHidden}
            {...wrapProps}
        >
            <ul className={`gfield_${type.toLowerCase()}`} id={name}>
                {options.map(({ isSelected, text, value }, index) => {
                    const choiceID = index + 1
                    const matchInput = fieldData.inputs ? fieldData.inputs.filter(input => value === input.label) : null
                    let actualId = matchInput && Array.isArray(matchInput) && matchInput[0]?.id ? matchInput[0].id : null
                    if (typeof actualId === "number"){
                        actualId = actualId.toString()
                    }
                    //const newInput = actualId ? `input_${actualId.replace('.', '_')}` : null
                    const newSubmitId = actualId ? actualId.substring(actualId.indexOf(".")) : null
                    //check for default values, update form data if they exist and not a hidden field
                    if(isSelected && firstUpdate.current && !fieldHidden){
                        setTimeout(() => handleBothOnChangeCalls(fieldData.id, value, newSubmitId ? newSubmitId : choiceID), 0);
                    }
                    //if checkbox hidden field changes to visible and has a default value, update form data
                    if(!firstUpdate.current && prev.current !== fieldHidden && isSelected && !fieldHidden){
                        setTimeout(() => handleBothOnChangeCalls(fieldData.id, value, newSubmitId ? newSubmitId : choiceID), 0);
                    }

                    return (
                        <li key={`${name}-${index + 1}`}>
                            <input
                                className={classnames(
                                    `gravityform__field__input__${type}`,
                                    `gravityform__field__input__${type}--` +
                                        choiceID,
                                    cssClass,
                                    size,
                                    fieldHiddenClass
                                )}
                                defaultChecked={isSelected}
                                id={`${name}_${choiceID}`}
                                name={name}
                                ref={register({
                                    required:!fieldHidden ? isRequired && strings.errors.required : false,
                                })}
                                type={type}
                                value={value}
                                onChange={() => handleBothOnChangeCalls(fieldData.id, value, newSubmitId ? newSubmitId : choiceID)}
                            />
                            &nbsp;
                            <label htmlFor={`${name}_${choiceID}`}>
                                {ReactHtmlParser(text)}
                            </label>
                        </li>
                    )
                })}
            </ul>
        </InputWrapper>
    )
}

export default SelectorList

SelectorList.propTypes = {
    errors: PropTypes.object,
    fieldData: PropTypes.shape({
        choices: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
          ]),
        cssClass: PropTypes.string,
        id: PropTypes.number,
        isRequired: PropTypes.bool,
        size: PropTypes.string,
        type: PropTypes.string,
    }),
    name: PropTypes.string,
    register: PropTypes.func,
    wrapProps: PropTypes.object,
}
