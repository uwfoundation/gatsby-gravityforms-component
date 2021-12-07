import React from 'react'
import strings from '../../utils/strings'

const FormGeneralError = props => {
    let errorMessage = ''

    if (props.errorCode === 'formHasError') {
        errorMessage = strings.errors.general
    }

    if (props.errorCode === 'unknownError') {
        errorMessage = strings.errors.unknownError
    }

    if (props.errorCode === 'leastOneField') {
        errorMessage = strings.errors.leastOneField
    }

    if (props.errorCode === 'formHasErrorWithMsg') {
        errorMessage = strings.errors.formHasErrorWithMsg
    }

    if (errorMessage) {
        return (
            <div className="gravityform__error_inform validation_error">
                {props.errorCode !== 'unknownError' ? <p>{errorMessage}</p> : <p dangerouslySetInnerHTML={{ __html:errorMessage}} className="unknownError"/>}
            </div>
        )
    } else {
        return false
    }
}

export default FormGeneralError