import classnames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import strings from '../../utils/strings'
import InputWrapper from '../InputWrapper'
import InputSubfieldWrapper from '../InputSubfieldWrapper'

const standardType = (type) => {
  switch (type) {
    case 'phone':
        return 'tel'
    case 'fileupload':
    case 'post_image':
        return 'file'
    case 'website':
        return 'url'
    default:
      return type
  }
}

const Input = ({ errors, fieldData, name, register, value, subfield, fromNameField, ...wrapProps }) => {
    const {
        cssClass,
        inputMaskValue,
        isRequired,
        maxLength,
        placeholder,
        size,
        type,
        id,
    } = fieldData
    const regex = inputMaskValue ? new RegExp(inputMaskValue) : false
    let inputType = standardType(type)
    const inputName = id && typeof id === 'string' ? `input_${id.replace(".", "_")}` : id ? id : name
    
    return (subfield) ? (<InputSubfieldWrapper
        errors={errors}
        inputData={fieldData}
        labelFor={name}
        {...wrapProps}
    ><input
        aria-invalid={errors}
        aria-required={isRequired}
        className={classnames(
            'gravityform__field__input',
            `gravityform__field__input__${type}`,
            cssClass,
            size
        )}
        defaultValue={value}
        id={`input_${id.replace(".", "_")}`}
        maxLength={fromNameField ? 51 : maxLength || 524288} // 524288 = 512kb, avoids invalid prop type error if maxLength is undefined.
        name={inputName}
        placeholder={placeholder}
        ref={register({
            required: isRequired && strings.errors.required,
            maxLength: fromNameField ? {
                value: 50,
                message: "Name must be less than 50 characters.",
            } : maxLength > 0 && maxLength ? {
                value: maxLength > 0 && maxLength,
                message:
                    maxLength > 0 &&
                    `${strings.errors.maxChar.front}  ${maxLength} ${strings.errors.maxChar.back}`,
            } : null,
            pattern: {
                value: fromNameField ?  /^[a-zA-Z' -]+$/ : regex,
                message: fromNameField ?  'Name can only contain letters, hyphens and apostrophes.' : regex && strings.errors.pattern,
            },
        })}
        type={type === 'phone' ? 'tel' : type === 'fileupload' ? 'file' : type === 'website' ? 'url' : type}
    /></InputSubfieldWrapper>) : (
        <InputWrapper
            errors={errors}
            inputData={fieldData}
            labelFor={name}
            {...wrapProps}
        >
            <input
                aria-invalid={errors}
                aria-required={isRequired}
                className={classnames(
                    'gravityform__field__input',
                    `gravityform__field__input__${type}`,
                    cssClass,
                    size
                )}
                defaultValue={value}
                id={name}
                maxLength={maxLength || 524288} // 524288 = 512kb, avoids invalid prop type error if maxLength is undefined.
                name={name}
                placeholder={placeholder}
                ref={register({
                    required: isRequired && strings.errors.required,
                    maxlength: {
                        value: maxLength > 0 && maxLength,
                        message:
                            maxLength > 0 &&
                            `${strings.errors.maxChar.front}  ${maxLength} ${strings.errors.maxChar.back}`,
                    },
                    pattern: {
                        value: regex,
                        message: regex && strings.errors.pattern,
                    },
                })}
                type={inputType}
            />
        </InputWrapper>
    )
}

export default Input

Input.propTypes = {
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
