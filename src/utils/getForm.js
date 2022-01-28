/**
 * Get the form from ID.
 * Takes the full dataset passed back graphQL. Loops through and returns
 * the form in question.
 * @param {mixed} formData Form dataset from graphQL.
 * @param {int} id Form ID from Gravity Forms.
 * @returns array or false.
 */
const getForm = (formData, id) => {
    if (formData && id) {
        // Filter returned data to get specific form
        const form = formData.edges.filter(function(form) {
            return parseInt(form.node.formId || form.node.databaseId) === parseInt(id)
        })

        // If we have a form, clean up a little more before returning
        // Do so many crazy checks because each level needs checking
        // to stop errors
        if (
            typeof form[0] !== 'undefined' &&
            typeof form[0]['node'] !== 'undefined'
        ) {
            return form[0]['node']
        }
    }

    return false
}
export default getForm