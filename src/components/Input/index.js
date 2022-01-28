import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import strings from '../../utils/strings'
import InputWrapper from '../InputWrapper'
import InputSubfieldWrapper from '../InputSubfieldWrapper'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

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

const Input = ({ errors, fieldData, name, register, value, fieldHidden, subfield, fromNameField, ...wrapProps }) => {
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
    const [phoneValue, setPhoneValue] = useState();
    let inputType = standardType(type)
    const inputName = id && typeof id === 'string' ? `input_${id.replace(".", "_")}` : id ? id : name
    const isAddressLineTwo = name && name === 'Address Line 2' ? true : false

    return (subfield) ? (<InputSubfieldWrapper
        errors={errors}
        inputData={fieldData}
        labelFor={name}
        fieldHidden={fieldHidden}
        {...wrapProps}
    ><input
        aria-invalid={errors}
        aria-required={!isAddressLineTwo ? isRequired : false}
        className={classnames(
            'gravityform__field__input',
            `gravityform__field__input__${type}`,
            cssClass,
            size
        )}
        defaultValue={value}
        id={typeof id === "string" ? `input_${id.replace(".", "_")}` : `input_${id.toString().replace(".", "_")}`}
        maxLength={fromNameField ? 51 : maxLength || 524288} // 524288 = 512kb, avoids invalid prop type error if maxLength is undefined.
        name={typeof inputName === "string" ? inputName : `input_${inputName.toString().replace(".", "_")}`}
        placeholder={placeholder}
        ref={register({
            required: isRequired && strings.errors.required && !isAddressLineTwo,
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
            fieldHidden={fieldHidden}
            {...wrapProps}
        >
            {type === 'phone' ? (<PhoneInput
                  //placeholder="Enter phone number"
                  type="phone"
                  name={name}
                  id={name}
                  maxLength="26"
                  defaultCountry="US"
                  //remove duplicate calling code number if phone number is 13 characters and the frist and second value is 1
                  value={phoneValue && phoneValue.length === 13 && phoneValue[1] === "1" && phoneValue[2] === "1" ? `+${phoneValue.substring(2)}` : phoneValue}
                  international={true}
                  limitMaxLength={true}
                  countryCallingCodeEditable={false}
                  onChange={setPhoneValue}
                  ref={register({
                    required: isRequired && strings.errors.required ,
                    maxLength: {
                        value: 25,
                        message: 'Phone number must be 25 characters or less.',
                    }
                  })}/>) 
                  : (<input
                aria-invalid={errors}
                aria-required={!fieldHidden ? isRequired : false}
                className={classnames(
                    'gravityform__field__input',
                    `gravityform__field__input__${type}`,
                    cssClass,
                    size
                )}
                defaultValue={value}
                id={name}
                maxLength={type === 'phone' ? 26 : type === 'text' ? 256 : maxLength || 524288} // 524288 = 512kb, avoids invalid prop type error if maxLength is undefined.
                name={name}
                placeholder={placeholder}
                ref={register({
                    required: !fieldHidden ? isRequired && strings.errors.required : false,
                    maxLength: type === 'phone' ? {
                        value: 25,
                        message: 'Phone number must be 25 characters or less.',
                    } : type === 'text' ? {
                        value: 255,
                        message: "Must be 255 characters or less.",
                    } : maxLength > 0 && maxLength ? {
                        value: maxLength > 0 && maxLength,
                        message:
                            maxLength > 0 &&
                            `${strings.errors.maxChar.front}  ${maxLength} ${strings.errors.maxChar.back}`,
                    } : null,
                    pattern: {
                        value: type === 'phone' 
                            ? /^[- ]*[0-9][- 0-9]*$/ 
                            : type === 'email' 
                                ? /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ 
                                : type === 'website'
                                    ? /^(http|https):/
                                    : regex,
                        message: type === 'phone' 
                            ? 'Phone number can only contain numbers and dashes.' 
                            : type === 'email' 
                                ? "Must be valid email address." 
                                : type === 'website'
                                    ? 'Must be a valid url starting with http:// or https://'
                                    : regex && strings.errors.pattern,
                    },
                })}
                type={inputType}
            />)}
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
