/**
 * Create new option that can be used in a card.
 * The option isn't resolved.
 *
 * @param {*} text text of the option
 * @param {*} actions actions the options will have (default empty)
 * @returns option object
 */
 export function virtualOption(text, actions = []) {
    return {
        text: text,
        actions: actions,
    };
}

/**
 * Action that skips to the next player.
 */
export const ACTION_NEXT = {
    type: "nextPlayer",
};

/**
 * Returns correspoding variable to name.
 *
 * @param {string} name: Name of the variable
 * @param {[*]} variables: List of all defined variables.
 * @returns {{value: {*}, name: {string}, string: {string}}}
 */
 export function getVariable(name, variables) {
    const variable = variables.find((v) => v.name === name);
    if (variable === undefined) {
        console.error("can't find a variable \"" + name+"\"");
    }
    return variable;
}