/**
 * Rearranges elements of a list in a random order.
 * This function uses the passed list and doesn't create a copy.
 * Thus nothing will be returned and all changes will appear in the passed list.   
 * 
 * @param {*} list
 */
export function shuffleList(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * list.length);
        [list[i], list[j]] = [list[j], list[i]];
    }
}
