function createGfKeyFromField(string) {
    const fieldName = 'input_'
    const field = string.slice(string.indexOf(fieldName) + fieldName.length)
    return field.replace('_', '.')
}

function doesObjectExist(obj) {
    if (typeof obj !== 'undefined') {
        return true
    }
    return false
}

function filteredKeys(obj, filter) {
    let key,
        keys = []
    for (key in obj)
        if ({}.hasOwnProperty.call(obj, key) && filter.test(key)) keys.push(key)
    return keys
}

function handleButtonDisabledState(isValid, isDirty, isSubmitted, formLoading, singleForm, currentValues) {
    // Default disabled behavior when no conditional logic applies
    const defaultDisabled = isSubmitted ? !isDirty : !isDirty || !isValid

    if (!singleForm?.submitButton?.conditionalLogic) return defaultDisabled

    const { actionType, logicType, rules } = singleForm.submitButton.conditionalLogic
    if (!Array.isArray(rules) || rules.length === 0) return defaultDisabled

    const tryGetFromValues = (fieldId) => {
        if (!currentValues || typeof currentValues !== 'object') return undefined
        const key = `input_${fieldId}`
        if (Object.prototype.hasOwnProperty.call(currentValues, key)) return currentValues[key]
        if (Object.prototype.hasOwnProperty.call(currentValues, fieldId)) return currentValues[fieldId]
        return undefined
    }

    const getFromDOM = (fieldId) => {
        try {
            if (typeof document === 'undefined') return undefined
            const name = `input_${fieldId}`
            const els = Array.from(document.getElementsByName(name))
            if (!els.length) {
                const el = document.getElementById(name)
                return el ? el.value : undefined
            }
            if (els.length === 1) {
                const el = els[0]
                if (el.type === 'checkbox') return el.checked ? (el.value || true) : false
                if (el.type === 'radio') return el.checked ? el.value : undefined
                return el.value
            }
            const checked = els.filter(e => e.checked)
            if (checked.length) return checked.length === 1 ? checked[0].value : checked.map(c => c.value)
            return els.map(e => e.value)
        } catch (e) {
            return undefined
        }
    }

    const getValue = (fieldId) => {
        const fromVals = tryGetFromValues(fieldId)
        if (typeof fromVals !== 'undefined') return fromVals
        return getFromDOM(fieldId)
    }

    const evalRule = (rule) => {
        const operator = (rule.operator || '').toString().toLowerCase()
        let conditionalValue = getValue(rule.fieldId)
        const expected = rule.value

        if (typeof conditionalValue === 'object' && conditionalValue !== null && !Array.isArray(conditionalValue)) {
            conditionalValue = JSON.stringify(conditionalValue)
        }

        switch (operator) {
            case 'is':
                return String(conditionalValue) === String(expected)
            case 'is not':
                return String(conditionalValue) !== String(expected)
            case 'greater than':
                return Number(conditionalValue) > Number(expected)
            case 'less than':
                return Number(conditionalValue) < Number(expected)
            case 'contains':
                if (Array.isArray(conditionalValue)) return conditionalValue.includes(expected)
                if (conditionalValue == null) return false
                return String(conditionalValue).indexOf(String(expected)) >= 0
            case 'starts with':
                if (typeof conditionalValue !== 'string') return false
                return conditionalValue.indexOf(String(expected)) === 0
            case 'ends with':
                if (typeof conditionalValue !== 'string') return false
                return conditionalValue.indexOf(String(expected)) === conditionalValue.length - String(expected).length
            default:
                return false
        }
    }

    const allRulesMet = rules.every(evalRule)
    const anyRuleMet = rules.some(evalRule)
    console.log(anyRuleMet)

    const action = (actionType || '').toString().toLowerCase()
    const logic = (logicType || '').toString().toLowerCase()

    // Map conditional logic to disabled boolean:
    // - SHOW + ALL: button shown only when allRulesMet -> disabled = !allRulesMet
    // - SHOW + ANY: button shown when anyRuleMet -> disabled = !anyRuleMet
    // - HIDE + ALL: button hidden when allRulesMet -> disabled = allRulesMet
    // - HIDE + ANY: button hidden when anyRuleMet -> disabled = anyRuleMet
    if (action === 'show') {
        if (logic === 'all') return !allRulesMet
        return !anyRuleMet
    }

    // default to hide behavior for other action types
    if (logic === 'all') return allRulesMet
    return anyRuleMet
}


module.exports = {
    createGfKeyFromField,
    doesObjectExist,
    filteredKeys,
    handleButtonDisabledState
}
