import classnames from 'classnames'
import get from 'lodash/get'
import React, { useState, useEffect } from 'react'

import Address from '../../components/Address'
import Captcha from '../../components/Captcha'
import Html from '../../components/Html'
import Input from '../../components/Input'
import InputWrapper from '../../components/InputWrapper'
import Multiselect from '../../components/Multiselect'
import Name from '../../components/Name'
import Select from '../../components/Select'
import SelectorList from '../../components/SelectorList'
import Textarea from '../../components/Textarea'
import { ifDefaultValue, islabelHidden } from '../../utils/inputSettings'
import { useFormContext } from 'react-hook-form'

const FieldBuilder = ({
    formData,
    presetValues = {},
    register,
    controls = {},
    formLoading,
    setFormLoading,
    onChange,
    options,
    recaptchaRef,
    captchaKey,
    countryList
}) => {
    const formFields = formData?.formFields?.length ? formData?.formFields : formData?.formFields?.nodes ? formData?.formFields?.nodes : formData[0].node.formFields.nodes //data is slightly different coming from API vs wpgraphql plugin
    formFields.forEach(field => field.type = field.type.toLowerCase())
    const {
        getValues,
      } = useFormContext();

    //find and replace ampersand html entitites from graphql plugin data
    const cleanupFields = (obj) => {
        Object.keys(obj).forEach(key => {
            if( typeof obj[key] === 'string' ){
                obj[key] = obj[key].replace('&amp;', '&')
            }
    
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            cleanupFields(obj[key])
            }
        })
    }
    cleanupFields(formFields);

    const [fieldValues, setfieldValues] = useState({});

    useEffect(() => {
        formFields.forEach(field => {
            if(field.type === 'radio' || field.type === 'checkbox'){
                populateChoiceValues(field)
            } else if(field.type === 'select'){
                populateSelectDefault(field)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const populateChoiceValues = (field) => {
        const formattedChoices = typeof field.choices === "string" ? JSON.parse(field.choices) : JSON.parse(JSON.stringify(field.choices))
        const selected = formattedChoices.filter(choice => {
            return choice.isSelected
        })
        setfieldValues({ ...fieldValues, [field.id]: selected.length ? selected[0].value : '' } )
    }

    const populateSelectDefault = (field) => {
        const formattedChoices = typeof field.choices === "string" ? JSON.parse(field.choices) : JSON.parse(JSON.stringify(field.choices))
        const selected = formattedChoices.filter(choice => {
            return choice.isSelected
        })
        setfieldValues({ ...fieldValues, [field.id]: selected.length > 0 ? selected[0].value : JSON.parse(typeof formattedChoices === "string" ? formattedChoices : JSON.stringify(formattedChoices))[0].value })
    }

    const handleFieldChange = (fieldId, value, inputId) => {
    
        let fieldInfo = formFields.filter(field => field.id === fieldId)

        if(fieldInfo && fieldInfo?.length > 0 && (fieldInfo[0].type === 'radio' ) && inputId){
            setfieldValues({
                ...fieldValues,
                [fieldId]: {
                    [inputId]: value,
                },
            })
        }
        if(fieldInfo && fieldInfo?.length > 0 && (fieldInfo[0].type === 'checkbox') && inputId){
            let checkIfExists = typeof fieldValues[fieldId] === 'object' ? Object.values(fieldValues[fieldId]).includes(value) : false;

            if(checkIfExists){
                const updatefv = {
                    ...fieldValues
                }
                delete updatefv[fieldId][inputId]
    
                setfieldValues(updatefv)

            }else{
                setfieldValues({
                    ...fieldValues,
                    [fieldId]: {
                        ...fieldValues[fieldId],
                        [inputId]: value,
                    },
                })
            }
        }
        if(fieldInfo && fieldInfo?.length > 0 && (fieldInfo[0].type === 'select' ) && value){
            setfieldValues({
                ...fieldValues,
                [fieldId]: value,
            })
        }
        //add default or other cases if not radio/replacing value
    }

    // Loop through fields and create
    return formFields.map(field => {
        // Set the wrapper classes
        const {
            descriptionPlacement: fieldDescPlace,
            isRequired,
            subLabelPlacement: fieldSubLabelPlace,
            visibility,
        } = field

        const descriptionPlacement =
            fieldDescPlace === "INHERIT" ? formData.descriptionPlacement?.toLowerCase() : fieldDescPlace || formData.descriptionPlacement?.toLowerCase()

        const subLabelPlacement =
            fieldSubLabelPlace || formData.subLabelPlacement?.toLowerCase()

        const fieldData = { ...field, descriptionPlacement }
        let inputWrapperClass = classnames(
            'gfield',
            'gravityform__field',
            'gravityform__field__' + field.type,
            'gravityform__field--' + field.size,
            field.cssClass,
            { 'field-required': field.isRequired },
            { 'hidden-label': islabelHidden(field.labelPlacement) },
            { gfield_contains_required: isRequired },
            { [`field_sublabel_${subLabelPlacement}`]: subLabelPlacement },
            `field_description_${descriptionPlacement}`,
            `gfield_visibility_${visibility}`
        )

        const wrapId = `field_${formData.formId}_${field.id}`

        //TODO: Should this match GF version "input_form.id_input.id"
        const inputName = `input_${field.id}`

        const componentProps = {
            formLoading: formLoading,
            setFormLoading: setFormLoading,
            fieldData: fieldData,
            key: field.id,
            name: inputName,
            register: register,
            value: get(presetValues, inputName, false)
                ? get(presetValues, inputName, false)
                : ifDefaultValue(field),

            wrapClassName: inputWrapperClass,
            wrapId: wrapId,
        }

        if (controls[field.type]) {
          return (<InputWrapper inputData={fieldData} labelFor={inputName} {...componentProps}>{React.cloneElement(controls[field.type], componentProps)}</InputWrapper>)
        }

        let currentVals = getValues()
        //CONDITIONAL LOGIC
        const conditionalLogic = field?.conditionalLogic && typeof field.conditionalLogic === "string" ? JSON.parse(field.conditionalLogic) : field?.conditionalLogic && typeof field.conditionalLogic !== "string" ? JSON.parse(JSON.stringify(field.conditionalLogic)) : null
        const handleConditionalLogic = (field) => {
            const rulesMet = !(field?.conditionalLogic) || !(conditionalLogic?.rules)
                ? null
                : conditionalLogic.rules.map(rule => {
                let conditionalValue = currentVals[`input_${rule.fieldId}`] || fieldValues[rule.fieldId] || fieldValues

                if (typeof conditionalValue === 'object' && Object.keys(conditionalValue).length && !Array.isArray(conditionalValue)) {
                    let matchKey = Object.keys(conditionalValue).filter(key => fieldValues[rule.fieldId]?.key === rule.value)
                    conditionalValue = matchKey && fieldValues[rule.fieldId]?.matchKey ? fieldValues[rule.fieldId][matchKey] : false
                } else if (typeof conditionalValue === 'object' && Object.keys(conditionalValue).length && Array.isArray(conditionalValue)) {
                    if (conditionalValue?.includes(rule.value)){
                        let matchKey = conditionalValue.indexOf(rule.value)
                        conditionalValue = conditionalValue ? conditionalValue[matchKey] : false
                    }
                }
                
                switch (rule.operator.toLowerCase()) {
                    case 'is':
                        return conditionalValue === rule.value
    
                    case 'is not':
                        return conditionalValue !== rule.value
    
                    case 'greater than':
                        return conditionalValue > rule.value
    
                    case 'less than':
                        return conditionalValue < rule.value
    
                    case 'contains':
                        return (typeof conditionalValue === 'object' && Object.keys(conditionalValue).length) || typeof conditionalValue === 'string' ? conditionalValue.indexOf(rule.value) >= 0 : false
    
                    case 'starts with':
                        return conditionalValue.indexOf(rule.value) === 0
    
                    case 'ends with':
                        return conditionalValue.indexOf(rule.value) === conditionalValue.length - rule.value.length
                    default:
                        return false
                }
                //console.log(conditionalValue, field.id, fieldValues)
            })
            
            //console.log(rulesMet, rulesMet.indexOf(false))
            
            if (conditionalLogic?.actionType && conditionalLogic.actionType.toLowerCase() === 'show') {
                return conditionalLogic?.logicType && conditionalLogic.logicType.toLowerCase() === 'all' 
                    ? rulesMet && rulesMet.indexOf(false) >= 0 
                    : rulesMet && rulesMet.indexOf(true) < 0
            } else {
                return conditionalLogic?.logicType && conditionalLogic.logicType.toLowerCase === 'all' 
                    ? rulesMet && rulesMet.indexOf(true) < 0 
                    : rulesMet && rulesMet.indexOf(false) >= 0
            }
        }

        const fieldHidden = (field) => {
            if (typeof conditionalLogic === 'object' && field.conditionalLogic !== null) {
                return handleConditionalLogic(field)
            }
            return false
        }

        switch (field.type) {
            // Add note for unsupported captcha field
            case 'captcha':
                return (
                    <Captcha
                        captchaTheme={field.captchaTheme}
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        wrapClassName={inputWrapperClass}
                        recaptchaRef={recaptchaRef}
                        captchaKey={captchaKey}
                    />
                )
            // Start with the standard fields
            case 'text':
            case 'number':
            case 'email':
            case 'hidden':
            case 'date':
            case 'phone':
            case 'fileupload':
            case 'website':
            case 'post_title':
            case 'post_image':
            case 'post_custom_field':
                return (
                    <Input
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        value={
                            get(presetValues, inputName, false)
                                ? get(presetValues, inputName, false)
                                : ifDefaultValue(field)
                        }
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        fieldHidden={fieldHidden(field)}
                    />
                )
            case 'textarea':
            case 'post_content':
                return (
                    <Textarea
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        fieldHidden={fieldHidden(field)}
                    />
                )
            case 'select':
                return (
                    <Select
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        handleFieldChange={handleFieldChange}
                        onChange={onChange}
                        fieldHidden={fieldHidden(field)}
                        options={options}
                    />
                )
            case 'multiselect':
                return (
                    <Multiselect
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                    />
                )
            case 'radio':
            case 'checkbox':
                return (
                    <SelectorList
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        onChange={onChange}
                        handleFieldChange={handleFieldChange}
                        fieldHidden={fieldHidden(field)}
                    />
                )
            case 'name':
                return (
                    <Name
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        value={
                            get(presetValues, inputName, false)
                                ? get(presetValues, inputName, false)
                                : ifDefaultValue(field)
                        }
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        fieldHidden={fieldHidden(field)}
                    />
                )
            case 'address':
                // loop through the input fields
                
                return (
                    <Address
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        value={
                            get(presetValues, inputName, false)
                                ? get(presetValues, inputName, false)
                                : ifDefaultValue(field)
                        }
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        fieldHidden={fieldHidden(field)}
                        handleFieldChange={handleFieldChange}
                        onChange={onChange}
                        countryList={countryList}
                    />
                )
            case 'html':
            case 'section':
                return (
                    <Html
                        fieldData={fieldData}
                        key={field.id}
                        name={inputName}
                        wrapClassName={inputWrapperClass}
                        wrapId={wrapId}
                        fieldHidden={fieldHidden(field)}
                    />
                )

            default:
                return null
        }
    })
}

export default FieldBuilder
