import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form/dist/index.ie11'
import ReactHtmlParser from 'react-html-parser'
import FormGeneralError from './components/FormGeneralError'
import FieldBuilder from './container/FieldBuilder'
import getForm from './utils/getForm'
import {
    handleGravityFormsValidationErrors,
    // manageMainFormError,
} from './utils/manageErrors'
import {
    submissionHasOneFieldEntry,
    cleanGroupedFields,
} from './utils/manageFormData'
import passToGravityForms from './utils/passToGravityForms'

/**
 * Component to take Gravity Form graphQL data and turn into
 * a fully functional form.
 * @param {mixed} formData Form dataset from graphQL
 * @param {int} id Form ID from Gravity Forms
 * @param {string} lambda API link for Lambda functions when working with
 *                        netlify or similar
 */
const GravityFormForm = ({
    id,
    formData,
    lambda,
    presetValues = {},
    successCallback = ({ reset }) => reset(),
    errorCallback,
    controls,
    onChange,
    checkboxes,
    options
}) => {
    // Pull in form functions
    const {
        errors,
        handleSubmit,
        register,
        reset,
        setError,
        setValue,
        formState: { isValid, isDirty, isSubmitted },
    } = useForm({mode : 'onChange'})

    const [generalError, setGeneralError] = useState('')
    const [formLoading, setLoadingState] = useState(false)

    // State for confirmation message
    const [confirmationMessage, setConfirmationMessage] = useState('')

    // Take ID argument and graphQL Gravity Form data for this form
    const singleForm = getForm(formData, id)

    const onSubmitCallback = async (values) => {
        // Make sure we are not already waiting for a response
        if (!formLoading) {
            // Clean error
            setGeneralError('')

            // Check that at least one field has been filled in
            if (submissionHasOneFieldEntry(values)) {
                setLoadingState(true)

                if(Object.keys(checkboxes).length > 0){
                    values = {...values, ...checkboxes}
                }
                
                //catch and handle null radio inputs when no choice is made
                Object.keys(values).forEach(key =>{
                    if(values[key] === null ){
                        values[key] = ''
                    }
                })

                const { data, status } = await passToGravityForms({
                    baseUrl: singleForm.apiURL,
                    formData: values,
                    id,
                    lambdaEndpoint: lambda,
                })

                setLoadingState(false)

                if (status === 'error') {
                    // Handle the errors
                    // First check to make sure we have the correct data

                    if (data?.status === 'gravityFormErrors') {
                        // Pass messages to handle that sets react-hook-form errors
                        handleGravityFormsValidationErrors(
                            data.validation_messages,
                            setError
                        )
                    } else {
                        // Seemed to be an unknown issue
                        setGeneralError('unknownError')
                    }

                    errorCallback &&
                        errorCallback({ values, error: data, reset })
                }

                if (status === 'success') {
                    const { confirmation_message } = data?.data

                    const { confirmations } = singleForm

                    const confirmation = confirmations?.find(
                        (el) => el.isDefault
                    )

                    setConfirmationMessage(
                        confirmation_message || confirmation?.message || false
                    )

                    successCallback({
                        values,
                        reset,
                        confirmations,
                    })

                    const confirmationContainer = typeof window !== 'undefined' ? document.getElementById("form-confirmation") : null
                    if(confirmationContainer){
                        confirmationContainer.scrollIntoView();
                    }
                }
            } else {
                setGeneralError('leastOneField')
            }
        }
    }

    if (!confirmationMessage) {
        return (
            <div className="gform_wrapper" id={`gform_wrapper_${id}`}>
                <div className="gform_anchor" id={`gf_${id}`} />
                {singleForm && (
                    <form
                        className={
                            formLoading
                                ? `gravityform gravityform--loading gravityform--id-${id}`
                                : `gravityform gravityform--id-${id}`
                        }
                        //TODO: ID change go GF standard "gfrom_1"?
                        id={`gravityform--id-${id}`}
                        key={`gravityform--id-${id}`}
                        onSubmit={handleSubmit(onSubmitCallback)}
                    >
                        {generalError && (
                            <FormGeneralError errorCode={generalError} />
                        )}
                        <div className="gform_body">
                            <ul
                                className={classnames(
                                    'gform_fields',
                                    {
                                        [`form_sublabel_${singleForm.subLabelPlacement}`]: singleForm.subLabelPlacement,
                                    },
                                    `description_${singleForm.descriptionPlacement}`,
                                    `${singleForm.labelPlacement}`
                                )}
                                id={`gform_fields_${id}`}
                            >
                                <FieldBuilder
                                    formLoading={formLoading}
                                    setFormLoading={setLoadingState}
                                    controls={controls}
                                    errors={errors}
                                    formData={singleForm}
                                    formId={typeof id === "number" ? id.toString() : id}
                                    presetValues={presetValues}
                                    register={register}
                                    setValue={setValue}
                                    onChange={onChange}
                                    options={options}
                                />
                            </ul>
                        </div>

                        <div
                            className={`gform_footer ${singleForm.labelPlacement}`}
                        >
                            <button
                                className="gravityform__button gform_button button"
                                disabled={formLoading}
                                id={`gform_submit_button_${id}`}
                                type="submit"
                                disabled={isSubmitted ? !isDirty : !isDirty || !isValid }
                            >
                                {formLoading ? (
                                    <span className="gravityform__button__loading_span">
                                        Loading
                                    </span>
                                ) : (
                                    singleForm?.button?.text || 'Submit'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        )
    }
    return (
        <div id="form-confirmation">
            {ReactHtmlParser(confirmationMessage)}
        </div>
    )
}

GravityFormForm.defaultProps = {
    lambda: '',
}

GravityFormForm.propTypes = {
    controls: PropTypes.object,
    errorCallback: PropTypes.func,
    formData: PropTypes.object.isRequired,
    id: PropTypes.oneOfType([
        PropTypes.number.isRequired,
        PropTypes.string.isRequired
      ]),
    lambda: PropTypes.string,
    successCallback: PropTypes.func,
    onChange: PropTypes.func,
    checkboxes: PropTypes.object,
}

export default GravityFormForm
