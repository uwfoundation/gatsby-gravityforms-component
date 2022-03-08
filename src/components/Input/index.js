import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useLayoutEffect, useEffect, useState} from 'react'
import strings from '../../utils/strings'
import InputWrapper from '../InputWrapper'
import InputSubfieldWrapper from '../InputSubfieldWrapper'
import 'react-phone-number-input/style.css'
import PhoneInputWithCountry from 'react-phone-number-input/react-hook-form'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { useFormContext } from 'react-hook-form'

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

const Input = ({ fieldData, name, value, fieldHidden, subfield, fromNameField, ...wrapProps }) => {
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
    const [defaultValue, setDefaultValue] = useState(null);
    const [phoneValue, setPhoneValue] = useState();
    const [currentPageTitle, setCurrentPageTitle] = useState();
    let inputType = standardType(type)
    const { formState, getValues, setValue, control, register } = useFormContext();
    const { errors } = formState

    //check if things are loaded, component did mount
    const firstUpdate = useRef(true);
    useLayoutEffect(() => {
        if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
        }
    });

    useEffect(() => {
        const defaultV = updateDefaultValue()
        const values = getValues();
        if(!formState.touchedFields[`${name}`] && !values[`${name}`] && defaultV ){
            setValue(name, defaultV, { shouldTouch: true });
        }
    }, [firstUpdate.current, setValue]);
    
    useEffect(() => {
        setTimeout(() => {
            if(typeof document !== "undefined"){
                if(document.querySelector("title").textContent.includes('| WFAA Advancement Hub')){
                    setCurrentPageTitle(document.querySelector("title").textContent.replace(' | WFAA Advancement Hub', '') )
                } else if(document.querySelector("title").textContent.includes('| Wisconsin Alumni Association')){
                    setCurrentPageTitle(document.querySelector("title").textContent.replace(' | Wisconsin Alumni Association', '') )
                } else {
                    setCurrentPageTitle(document.querySelector("title").textContent)
                }
            }
          }, 1);
    }, []);

    //add/update default value if using current or prev class
    useEffect(() => {
        if(cssClass && cssClass.includes("currentPageTitle") && currentPageTitle){
            setValue(name, currentPageTitle, { shouldTouch: true });
        }
        if(cssClass && cssClass.includes("prevPageTitle") && window?.localStorage?.prevpage_title){
            setValue(name, window.localStorage.prevpage_title, { shouldTouch: true });
        }
    }, [currentPageTitle, cssClass]);
    
    const updateDefaultValue = () => {
        const fieldValue = fieldData.inputName ? fieldData.inputName : null //if it's a hidden field, the parameter value is stored under inputName
        const adminField = fieldData?.visibility?.toLowerCase() === 'administrative' ? true : false
        const checkForPageTitle = adminField && fieldData.defaultValue === '{embed_post:post_title}' ? true : false //if it's a regular text field w/visibility set to admin, the value is stored under defaultValue

        const paramToCheck = fieldValue && fieldValue !== '' ? fieldValue : null
        const queryToCheck = firstUpdate.current === false ? new URLSearchParams(document.location.search.substring(1)): null;
        
        const param = paramToCheck && queryToCheck ? queryToCheck.get(paramToCheck) : null;
        
        let hiddenValue = checkForPageTitle ? currentPageTitle : param && param.match(/^[0-9a-zA-Z _%-]+$/)? param : ''; //if defaultValue exists, set to defaultvalue, otherwise, check if param exists in query - returns empty string if it does not
        
        return hiddenValue !== null ? hiddenValue : value
    }

    const isAddressLineTwo = name && name === 'Address Line 2' ? true : false
    const inputName = id && typeof id === 'string' ? `input_${id.replace(".", "_")}` : id ? id : name
    
    return (subfield) ? (<InputSubfieldWrapper
        errors={errors[inputName]}
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
        id={typeof id === "string" ? `input_${id.replace(".", "_")}` : `input_${id.toString().replace(".", "_")}`}
        maxLength={fromNameField ? 51 : maxLength || 524288} // 524288 = 512kb, avoids invalid prop type error if maxLength is undefined.
        name={typeof inputName === "string" ? inputName : `input_${inputName.toString().replace(".", "_")}`}
        placeholder={placeholder}
        {...register(name, {
            value: defaultValue,
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
            errors={errors[name]}
            inputData={fieldData}
            labelFor={name}
            fieldHidden={fieldHidden}
            {...wrapProps}
        >
            {type === 'phone' ? (<PhoneInputWithCountry
                  name={name}
                  id={name}
                  maxLength="26"
                  defaultCountry="US"
                  control={control}
                  international={true}
                  limitMaxLength={true}
                  countryCallingCodeEditable={false}
                  onChange={setPhoneValue}
                  rules={{
                      required: !fieldHidden ? isRequired : false,
                      validate: isPossiblePhoneNumber,
                  }}
                  />) 
                  : (<input
                aria-invalid={errors}
                aria-required={!fieldHidden ? isRequired : false}
                className={classnames(
                    'gravityform__field__input',
                    `gravityform__field__input__${type}`,
                    cssClass,
                    size
                )}
                id={name}
                maxLength={type === 'phone' ? 26 : type === 'text' ? 256 : maxLength || 524288} // 524288 = 512kb, avoids invalid prop type error if maxLength is undefined.
                name={name}
                placeholder={placeholder}
                {...register(name, {
                    value: defaultValue,
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
