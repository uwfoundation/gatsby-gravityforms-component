import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import InputWrapper from '../../components/InputWrapper'
import strings from '../../utils/strings'
import { useFormContext } from "react-hook-form";

const Textarea = ({
    fieldData,
    name,
    value,
    wrapClassName,
    wrapId,
    fieldHidden
}) => {
    const {
        register,
        formState: { errors },
      } = useFormContext();
    const {
        cssClass,
        inputMaskValue,
        isRequired,
        maxLength,
        placeholder,
        size,
        type,
    } = fieldData
    const [textareaCharLeft, setCharLeft ] = useState(5000)
    
    const regex = inputMaskValue ? new RegExp(inputMaskValue) : false
    let charactersLeft = maxLength ? maxLength : 5000
    let maxChar = maxLength ? maxLength : 5000
    useEffect(() => {
        setCharLeft(charactersLeft)
    }, [charactersLeft]);
    const updateOnChangeValues = (e) => {
        if(e.target.type === 'textarea'){
          let currentLength = e.target.value.length
          if(currentLength > maxChar){
            charactersLeft = 0
            setCharLeft(charactersLeft)
          } else{
            charactersLeft = maxChar - currentLength
            setCharLeft(charactersLeft)
          }
        }
    }

    return (
        <InputWrapper
            errors={errors[name]}
            inputData={fieldData}
            labelFor={name}
            wrapClassName={wrapClassName}
            wrapId={wrapId}
            fieldHidden={fieldHidden}
        >
            <textarea
                aria-invalid={errors}
                aria-required={!fieldHidden ? isRequired : false}
                className={classnames(
                    'gravityform__field__input',
                    `gravityform__field__input__${type}`,
                    cssClass,
                    size,
                    'textarea'
                )}
                defaultValue={value}
                id={name}
                maxLength={maxLength > 0 ? maxLength : 5000}
                name={name}
                placeholder={placeholder}
                {...register(name, {
                    required: !fieldHidden ? isRequired && strings.errors.required : false,
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
                    onChange: (e) => updateOnChangeValues(e),
                })}
                type={type}
            />
            {textareaCharLeft < maxChar && <div style={{fontSize : `14px`}}>{textareaCharLeft} characters left</div>}
        </InputWrapper>
    )
}

export default Textarea

Textarea.propTypes = {
    errors: PropTypes.object,
    fieldData: PropTypes.shape({
        cssClass: PropTypes.string,
        description: PropTypes.string,
        inputMaskValue: PropTypes.string,
        label: PropTypes.string,
        descriptionPlacement: PropTypes.string,
        maxLength: PropTypes.number,
        placeholder: PropTypes.string,
        isRequired: PropTypes.bool,
        type: PropTypes.string,
        size: PropTypes.string,
    }),
    name: PropTypes.string,
    register: PropTypes.func,
    value: PropTypes.string,
    wrapClassName: PropTypes.string,
    wrapId: PropTypes.string,
}
