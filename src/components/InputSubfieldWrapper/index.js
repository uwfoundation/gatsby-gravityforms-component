import classnames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { outputDescription } from '../../utils/inputSettings'

const InputSubfieldWrapper = ({
    children,
    errors,
    inputData: {
        cssClass,
        description,
        descriptionPlacement,
        isRequired,
        label,
        maxLength,
        type,
    },
    labelFor,
    wrapClassName,
    wrapId,
    fieldHidden
}) => {
    //console.log(label)
    const fieldHiddenClass = fieldHidden === true ? 'gform_hidden' : ''
    const isAddressLineTwo = label === 'Address Line 2' ? true: false

    return (
        <div
            className={classnames(
                wrapClassName,
                errors && 'gravityform__field--error',
                cssClass, 'subfield__wrapper',
                fieldHiddenClass
            )}
            id={wrapId}
        >
            
            {outputDescription(
                description,
                descriptionPlacement,
                'above',
                errors
            )}
            <div className={`ginput_container ginput_container_${type}`}>
                {children}
                {maxLength > 0 && (
                    <div className="charleft ginput_counter warningTextareaInfo">
                        {maxLengthSentence(maxLength, type)}
                    </div>
                )}
                {/* TODO: Implement number min/max, these currently aren't fetch by the source plugin
                    https://docs.gravityforms.com/field-object/#number
                    <div class="instruction ">
                      Please enter a number from <strong>1</strong> to <strong>15</strong>.
                    </div>
                */}
            </div>
            { !(type === 'html') && (
            <label
                className="gravityform__label gfield_label gfield_label--subfield"
                htmlFor={labelFor}
            >
                {label}
                {isRequired && !isAddressLineTwo && <span className="gfield_required">*</span>}
            </label>
        )}
            {outputDescription(
                description,
                descriptionPlacement,
                'below',
                errors
            )}
            {errors && (errors.message || errors?.type === "required") && (
                <div
                    aria-live="polite"
                    className="gravityform__error_message gfield_description validation_message"
                >
                    {errors?.type === "required" ? 'This field is required.' : ReactHtmlParser(errors.message)}
                </div>
            )}
        </div>
    )
}

const maxLengthSentence = (length, type) => {
    let word = type === 'number' ? 'numbers' : 'characters'
    return length && ` (maximum ${length} ${word})`
}

export default InputSubfieldWrapper

InputSubfieldWrapper.propTypes = {
    children: PropTypes.node,
    errors: PropTypes.object,
    inputData: PropTypes.shape({
        description: PropTypes.string,
        descriptionPlacement: PropTypes.string,
        label: PropTypes.string,
        isRequired: PropTypes.bool,
        maxLength: PropTypes.number,
        type: PropTypes.string,
        cssClass: PropTypes.string,
    }),
    labelFor: PropTypes.string,
    wrapClassName: PropTypes.string,
    wrapId: PropTypes.string,
}