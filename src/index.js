import classnames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
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
    successCallback,
    errorCallback,
    controls,
    onChange,
    checkboxes,
    options,
    captchaKey,
    countryList
}) => {
    // Pull in form functions
    const methods = useForm({mode : 'onChange'});
    const {
      handleSubmit,
      setError,
      reset,
      formState: { isValid, isDirty, isSubmitted, errors },
    } = methods;

    const [generalError, setGeneralError] = useState('')
    const [formLoading, setLoadingState] = useState(false)
    const recaptchaRef = useRef(null)

    // State for confirmation message
    const [confirmationMessage, setConfirmationMessage] = useState('')

    // Take ID argument and graphQL Gravity Form data for this form
    const singleForm = getForm(formData, id)

    const isMultipart = singleForm && singleForm?.formFields ? checkForMultipart(singleForm.formFields) : false

    function checkForMultipart( myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].type === "fileupload" || myArray[i].type === "post_image") {
                return true
            }
        }
    }

    const onSubmitCallback = async (values) => {
        // Make sure we are not already waiting for a response
        if (!formLoading) {
            // Clean error
            setGeneralError('')

            // Check that at least one field has been filled in
            if (submissionHasOneFieldEntry(values)) {
                setLoadingState(true)

                //check formData for checkbox fields and make an array
                const checkboxFields = []
                const formFieldsToCheck = singleForm?.formFields?.nodes || singleForm?.formFields
                formFieldsToCheck.map(field => {
                    if(field.type.toLowerCase() === "checkbox" ){
                        checkboxFields.push(`input_${field.id}`)
                    }
                })

                //catch and handle null radio inputs when no choice is made as well as undefined fields from react-hook-forms
                Object.keys(values).forEach(key =>{
                    if(values[key] === null || values[key] === undefined ){
                        values[key] = ''
                    } else if(checkboxFields.includes(key)){
                        //reformat checkbox data for gravity forms to consume
                        if(Array.isArray(values[key])){
                            const arraytoUpdate = values[key]
                            let newobj = {}
                            let count = 1
                            arraytoUpdate.forEach(value => {
                                newobj[`${key}_${count}`] = value
                                count = count + 1
                            })
                            values = {...values, ...newobj}
                            delete values[key]
                        } else if(typeof values[key] === 'string'){
                            //if it's a single checkbox, it comes through as a string
                            let newVal = {}
                            newVal[`${key}_1`] = values[key]
                            values = {...values, ...newVal}
                            delete values[key]
                        }

                    }
                })

                if(Object.keys(values).includes('g-recaptcha-response')){
                    const token = await recaptchaRef.current.executeAsync();
                    values['g-recaptcha-response'] = token
                }

                function checkForPhoneInput( myArray){
                    for (var i=0; i < myArray.length; i++) {
                        if (myArray[i].type === "phone") {
                            return true
                        }
                    }
                }
                //clean up PhoneInput data
                if((singleForm && singleForm?.formFields) || (singleForm && singleForm?.formFields?.nodes)){
                    if(checkForPhoneInput(singleForm?.formFields) || checkForPhoneInput(singleForm?.formFields?.nodes)){
                        Object.keys(values).forEach(key =>{
                            if(values[key] === '+1' ){
                                values[key] = ''
                            }
                        })
                    }
                }

                const { data, status } = await passToGravityForms({
                    baseUrl: singleForm.apiURL,
                    formData: values,
                    id,
                    lambdaEndpoint: lambda,
                })

                setLoadingState(false)

                const returnData = data?.data

                if (status === 'error' || returnData?.is_valid === false) {
                    // Handle the errors
                    // First check to make sure we have the correct data

                    if (data?.status === 'gravityFormErrors') {
                        // Pass messages to handle react-hook-form errors
                        handleGravityFormsValidationErrors(
                            data.validation_messages,
                            setError,
                            singleForm
                        )
                    } else if(returnData?.is_valid === false){
                        if(returnData?.validation_messages && Object.keys(returnData?.validation_messages).length > 0){
                            handleGravityFormsValidationErrors(
                                returnData.validation_messages,
                                setError,
                                singleForm
                            )
                        } else{
                            setGeneralError('formHasError')
                        }
                    } else {
                        // Seemed to be an unknown issue
                        setGeneralError('unknownError')
                    }

                    errorCallback &&
                        errorCallback({ values, error: data, reset })
                }

                if (status === 'success') {
                    const { confirmation_message, confirmation_type, confirmation_redirect } = data?.data

                    if( confirmation_type === "redirect" && confirmation_redirect){
                        window.location.href = confirmation_redirect;
                    }

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
                        formData: singleForm,
                    })

                    const confirmationContainer = document.getElementById("form-confirmation")
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
                    <FormProvider {...methods} >
                        <form
                            className={
                                formLoading
                                    ? `gravityform gravityform--loading gravityform--id-${id}`
                                    : `gravityform gravityform--id-${id}`
                            }
                            //TODO: ID change go GF standard "gfrom_1"?
                            id={`gravityform--id-${id}`}
                            key={`gravityform--id-${id}`}
                            onSubmit={methods.handleSubmit(onSubmitCallback)}
                            encType={isMultipart ? "multipart/form-data" : null}
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
                                        register={methods.register}
                                        setValue={methods.setValue}
                                        onChange={onChange}
                                        options={options}
                                        recaptchaRef={recaptchaRef}
                                        captchaKey={captchaKey}
                                        countryList={countryList}
                                    />
                                </ul>
                            </div>

                            <div
                                className={`gform_footer ${singleForm.labelPlacement}`}
                            >
                                {!isValid && <p className="inactive-btn-msg">Please complete all required (<span>*</span>) fields and correct any error(s) above.</p>}
                                <button
                                    className="gravityform__button gform_button button"
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
                    </FormProvider>
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
