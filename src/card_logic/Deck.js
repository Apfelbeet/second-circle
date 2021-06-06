import { shuffleList } from "../util/util";
import {unifyCards} from "./CardUnifier";

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
let notifyDecklistFunc = () => {};

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
 * Draws a random card from a list of cards regarding the frequency of the cards.
 * @param {[*]} cards: list of cards
 * @returns {*} card
 */
function drawCardFromList(cards) {
    //selected is a subset of cardSet.
    //generate random value (0-1), all cards with a bigger frequency property are contained in this subset.
    //if the subset is empty this process will be repeated until the subset is not empty.
    let selected = [];
    let panic = 0;
    do {
        const ran = Math.random();
        selected = cards.filter((card) => ran < card.frequency);
        if (++panic === 100) {
            selected = cards;
            break;
        }
    } while (selected.length === 0);

    //select random value from subset
    const r = Math.random(new Date().getMilliseconds()) * selected.length;
    return selected[Math.floor(r)];
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
 * drawShuffled is a way to get the cards of an type in random order.
 * Each key has it own entry, which stores a list of indices mapping to
 * the corresponding card in the list of all cards the passed type
 * and a current index, show to a point in this list.
 * This pointer shows the next card, that will be drawn.
 *
 * With each call of a key the index/pointer that entry will be used to
 * draw the next card and will be increased by 1 (or set to zero if the end of the list is reached).
 *
 * If a key is called and the pointer is zero the mapping list will be shuffled.
 *
 * Currently the frequency and appearance property of a card are ignored.
 *
 * @param {Deck} deck
 * @param {*} type
 * @param {PlayerState} source
 * @param {GlobalState} globalState
 * @param {*} key: will be used to find or store the right entry.
 * @returns next card
 */
const drawShuffled = (deck, type, source, globalState, key) => {
    //If there is no map, a new map is need.
    if (deck.drawShuffledMap === undefined) {
        deck.drawShuffledMap = new Map();
    }

    if (!deck.drawShuffledMap.has(key)) {
        deck.drawShuffledMap.set(key, {
            index: 0,
            mapping: [...Array(deck.getCardsByType(type).length).keys()],
        });
    }

    const entry = deck.drawShuffledMap.get(key);
    if (entry.mapping.length === 0) {
        return drawRandom(deck, type, source, globalState);
    }

    if (entry.index === 0) {
        shuffleList(entry.mapping);
    }

    const allCards = deck.getCardsByType(type);
    const card = allCards[entry.mapping[entry.index]];
    entry.index = (entry.index + 1) % allCards.length;
    return card;
};

/**
 * Draws a random card of the passed type. It favors cards that are
 * allowed at the position of the source, but if it dosn't find such a card,
 * any other card of this type may be returned. Same applies if there is no
 * card of the passed type.
 *
 * @param {*} deck
 * @param {*} type
 * @param {*} source
 * @param {*} globalState
 * @returns random card of passed type
 */
const drawRandom = (deck, type, source, globalState) => {
    //All cards of a type
    const cards = deck.getCardsByType(type);
    const boardLength = globalState.boardState.squares.length;

    //cardSet is the final set of cards that are possible.
    //There different kinds of sets:
    //1. Cards of the favored type if they are in the right range of the appearance.
    //2. All cards of the favored type, if there no cards in 1.
    //3. All cards regradless of the favored type, if there no cards in 2.
    let cardSet;
    //if no cards of this type are specified, all cards regardless the type will be taken.
    if (cards === undefined || cards.length === 0) {
        cardSet = deck.getAllCards();
    } else {
        const cardsInAppearanceRange = deck.getCardsByTypeAndPosition(
            type,
            source.position,
            boardLength
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
        return drawCardFromList(cardSet);
    }
};

const defaultFinishCards = [
    {
        text: "Congrats! You have won!",
        frequency: 1,
    },
];

/**
 * A deck represents a set of cards in diffrent categories.
 *
 * The structure of a deck is:
 * {
 *  settings: {
 *      //Whether the board is visible or not.
 *      "board": {boolean}
 *  },
 *  data: [
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
 *
 *      //The order with which the cards are drawn.
 *      "order": "shuffledGlobal|shuffledIndividual|random"
 *  },
 *  ...
 * ]
 * }
 *
 */
class Deck {
    constructor(deck) {
        if (deck === undefined || deck.data === undefined) {
            console.error("couldn't load deck");
            return;
        }

        this.data = deck.data;
        this.data.forEach(type => {type.cards = unifyCards(type.cards)});
        console.log(this.data);

        this.settings = deck.settings;
        if (this.settings === undefined || typeof this.settings !== "object") {
            this.settings = {};
        }
        if (
            this.settings.board === undefined ||
            typeof this.settings.board !== "boolean"
        ) {
            this.settings.board = true;
        }

        //assign card of finish type to this.finishCards
        if (this.settings.finishTypeName === undefined) {
            this.finishCards = defaultFinishCards;
        } else {
            const ft = this.getTypeByName(this.settings.finishTypeName)
            if (ft === undefined)
                this.finishCards = defaultFinishCards;
            else
                this.finishCards = this.getCardsByType(ft);
        }
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
                    order: type.order,
                };
            })
            .filter((type) => type !== undefined && type.name !== undefined);
    }

    /**
     * Get random type/categorie from a deck, to generate the board.
     *
     * @returns
     */
    randomType() {
        let selectedTypes;

        do {
            const ran = Math.random();
            selectedTypes = this.getTypes().filter(
                (value) => ran < value.frequency
            );
        } while (selectedTypes.length === 0);

        const x =
            selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
        return x;
    }

    /**
     * Returns type with the passed name.
     * @param {String} name of the type
     * @returns Type/category object
     */
    getTypeByName(name) {
        return this.getTypes().find((t) => t.name === name);
    }

    /**
     * @returns list of all cards of one category/type
     */
    getCardsByType(type) {
        const cardSet = this.data.find((set) => set.name === type.name);
        if (cardSet === undefined) {
            console.error("couldn't find card type.");
            return undefined;
        }
        return cardSet.cards;
    }

    /**
     *
     * @param {*} type
     * @param {number} position
     * @param {number} boardLength
     * @returns all cards of that type that can be on this position.
     */
    getCardsByTypeAndPosition(type, position, boardLength) {
        return this.getCardsByType(type).filter(
            (c) =>
                c.appearance === undefined ||
                (c.appearance.lower * boardLength <= position &&
                    c.appearance.upper * boardLength >= position)
        );
    }

    /**
     *
     * @returns return list of all cards of any category
     */
    getAllCards() {
        return this.data.reduce((a, b) => a.concat(b), []);
    }

    /**
     * Draws card depending of the players position and square type.
     *
     * @param {*} type
     * @param {*} source
     * @param {*} globalState
     * @returns card
     */
    drawCard(type, source, globalState) {
        switch (type.order) {
            case "shuffledGlobal":
                return drawShuffled(this, type, source, globalState, type.name);
            case "shuffledIndividual":
                return drawShuffled(
                    this,
                    type,
                    source,
                    globalState,
                    type.name + "|" + source.id
                );
            default:
                return drawRandom(this, type, source, globalState);
        }
    }

    drawFinishCard() {
        return drawCardFromList(this.finishCards);
    }
}
