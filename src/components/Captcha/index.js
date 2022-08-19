import PropTypes from 'prop-types'
import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useFormContext } from "react-hook-form";

import InputWrapper from '../InputWrapper'

const Captcha = ({
    captchaTheme,
    fieldData,
    name,
    recaptchaRef,
    captchaKey,
    ...wrapProps
}) => {
    const { register, errors } = useFormContext();
    if (!captchaKey) {
        return (
            <div className="gravityform__captcha_notification">
                <p>
                    <strong>
                        To use reCAPTCHA, you need to sign up for an API key
                        pair for your site and use it as a node environment
                        variable named GATSBY_RECAPTCHA_SITE_KEY. The key pair
                        consists of a site key and secret. The site key is used
                        to display the widget on your site. Sign up for an API
                        key pair at
                        <a
                            href="http://www.google.com/recaptcha"
                            rel="noopener noreferrer"
                            target="_blank"
                            title="This link opens a new page"
                        >
                            http://www.google.com/recaptcha
                        </a>
                    </strong>
                </p>
            </div>
        )
    }


    return (
        <InputWrapper
            errors={errors}
            inputData={fieldData}
            labelFor={name}
            {...wrapProps}
        >
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={captchaKey}
                theme={captchaTheme || 'light'}
                size="invisible"
            />
            <input
                name="g-recaptcha-response"
                {...register('g-recaptcha-response', {})}
                type="hidden"
            />
           <p className="recaptchaBranding">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.</p>
        </InputWrapper>
    )
}

Captcha.propTypes = {
    captchaTheme: PropTypes.string,
    errors: PropTypes.object,
    fieldData: PropTypes.object,
    name: PropTypes.string,
    register: PropTypes.func,
    setValue: PropTypes.func,
    wrapClassName: PropTypes.string,
}

export default Captcha
