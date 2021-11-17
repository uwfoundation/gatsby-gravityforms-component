import axios from 'axios'

const PassToGravityForms = async ({ formData, lambdaEndpoint }) => {
    let newFormData = new FormData()
    //check for Filelist object, and if length is greater than 0 update value to first file
    Object.keys(formData).forEach(function (key) {
        if(typeof formData[key] === 'object' && formData[key] !== null && Object.keys(formData[key]).length > 0){
            formData[key]=formData[key][0]
            //add file object to form data
            newFormData.append(key, formData[key])
        } else{
            //add all other fields to form data
            newFormData.append(key, formData[key])
        }
    });

    let result
    try {
        result = await axios.post(lambdaEndpoint, newFormData)
    }catch (err) {
        // Pass back error
        return {
            status: 'error',
            data: err.response,
        }
    }
    return {
        status: 'success',
        data: result,
    }
}

export default PassToGravityForms