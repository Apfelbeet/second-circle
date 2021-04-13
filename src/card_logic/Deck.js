/**
 * List of all decks there are installed.
 * This list will be overwritten by the loadDecklist() function as soon as the server response to teh request.
 * 
 * You can get the list by using getDeckList().
 * 
 * The json structure is:
 * [
 *  {
 *      "name": {string}
 *      
 *      //the path is used to load the cards of the selected deck.
 *      "path": {string}
 *  },
 *  ...
 * ]
 */
let DECKLIST = [];

export function getDeckList() {
    return DECKLIST;
}



/**
 * Stores a function that will be called if the deck is loaded.
 * Other portion of the application can replace this function, using notifyAboutDecklist().
 * (currently there is only one function at a time, that can be called. TODO: allow multiple functions at a time)
 */
let notifyDecklistFunc = () => { };

export function notifyAboutDecklist(func) {
    notifyDecklistFunc = func;
}

/**
 * Requests a list of all available decks from the server.
 * 
 * When receiving the response, DECKLIST will be updated and notifyDecklistFunc() will be called. 
 */
export function loadDecklist() {
    const url = "/assets/deck_config.json";

    fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    })
        .then((res) => {
            return res.json();
        })
        .then((jsonData) => {
            DECKLIST = jsonData;
            notifyDecklistFunc();
        })
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Uses the path of the deck to request all cards of the deck 
 * and sets the current deck of the gamestate to the loaded one.
 * 
 * This request is asynchronous the effect won't be immediately.
 * @param {*} deck
 * @param {*} globalState
 * @param {*} setGlobalState
 */
export function loadDeck(deck, globalState, setGlobalState) {
    const url = "/assets/decks/" + deck.path;

    fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    })
        .then((res) => res.json())
        .then((jsonData) => {
            setGlobalState(globalState.withDeck(new Deck(jsonData)));
        })
        .catch((err) => {
            console.error(err);
            setGlobalState(globalState.withDeck(undefined));
        });
}

/**
 * Uses the name of the deck to find teh right path and performs loadDeck().
 * 
 * @param {*} name 
 * @param {*} globalState 
 * @param {*} setGlobalState 
 */
export function loadDeckFromName(name, globalState, setGlobalState) {
    const x = DECKLIST.find((dl) => dl.name === name);
    if (x === undefined) {
        console.error("deck not found");
        setGlobalState(globalState.withDeck(undefined));
    } else {
        loadDeck(x, globalState, setGlobalState);
    }
}

/**
 * A deck represents a set of cards in diffrent categories.
 * 
 * The structure of a deck(data) is:
 * [
 *  //Catgorie
 *  {
 *      
 *      "name": {string},
 *      "frequency": 0-1,
 * 
 *      //icon that will be display on the sqaure.
 *      //Use the name of the icon you want: https://react-icons.github.io/react-icons/icons?name=fa
 *      "icon": {string},
 * 
 *      //List of all cards
 *      "cards" [...]
 *  },
 *  ...
 * ]
 */
class Deck {
    constructor(data) {
        if (data === undefined) {
            console.error("clouldn't load deck");
            return;
        }

        this.data = data;
    }

    /**
     * @returns list of all categories this deck has.
     */
    getTypes() {
        return this.data
            .map((type) => {
                return {
                    name: type.name,
                    frequency:
                        type.frequency === undefined ? 0 : type.frequency,
                    icon: type.icon,
                };
            })
            .filter((type) => type !== undefined && type.name !== undefined);
    }

    /**
     * @returns list of all cards of one category/type
     */
    getCardsByType(type) {
        const cardSet = this.data.find((set) => set.name === type.name);
        if (cardSet === undefined) {
            console.error("couldn't find card-type: " + type);
            return undefined;
        }
        return cardSet.cards;
    }

    /**
     * 
     * @returns return list of all cards of any category
     */
    getAllCards() {
        return this.data.reduce((a, b) => a.concat(b), []);
    }

    /**
     * Every card has a appearance property, only players in the boundaries of the appearance should get this card.
     * In case there is no card specified for a position, all cards of the same type are considered as possible card.
     * 
     * @param {*} type category/type of the card
     * @param {*} position: current position of the source.
     * @param {*} globalState
     * @returns random card of a categorie
     */
    getRandomCard(type, position, globalState) {
        //All cards of a type
        const cards = this.getCardsByType(type);
        const boardLength = globalState.boardState.squares.length;

        //cardSet is the final set of cards that are possible.
        //There different kinds of sets:
        //1. Cards of the favored type if they are in the right range of the appearance.
        //2. All cards of the favored type, if there no cards in 1.
        //3. All cards regradless of the favored type, if there no cards in 2.
        let cardSet;
        //if no cards of this type are specified, all cards regardless the type will be taken.
        if (cards === undefined || cards.length === 0) {
            cardSet = this.getAllCards();
        }else {
            
            const cardsInAppearanceRange = cards.filter(
                (c) =>
                    c.appearance.lower * boardLength <= position &&
                    c.appearance.upper * boardLength >= position
            );
    
            
            if (cardsInAppearanceRange.length === 0) {
                cardSet = cards;
            } else {
                cardSet = cardsInAppearanceRange;
            }
        }

        //After cardSet is defined, a random card gets picked.
        if (cardSet.length === 1) {
            return cardSet[0];
        } else {
            //selected is a subset of cardSet.
            //generate random value (0-1), all cards with a bigger frequency property are contained in this subset.
            //if the subset is empty this process will be repeated until the subset is not empty.
            let selected = [];
            do {
                const ran = Math.random();
                selected = cardSet.filter(card => ran < card.frequency);
            } while (selected.length === 0);

            //select random value from subset
            const r = Math.random(new Date().getMilliseconds()) * selected.length;
            return selected[Math.floor(r)];
        }
    }
}
