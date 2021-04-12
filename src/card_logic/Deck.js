let DECKLIST = [];

let notifyDecklistFunc = () => { };

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

export function notifyAboutDecklist(func) {
    notifyDecklistFunc = func;
}

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

export function getDeckList() {
    return DECKLIST;
}

export function loadDeckFromName(name, globalState, setGlobalState) {
    const x = DECKLIST.find((dl) => dl.name === name);
    if (x === undefined) {
        console.error("deck not found");
        setGlobalState(globalState.withDeck(undefined));
    } else {
        loadDeck(x, globalState, setGlobalState);
    }
}

class Deck {
    constructor(data) {
        if (data === undefined) {
            console.error("clouldn't load deck");
            return;
        }

        this.data = data;
    }

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

    getCardsByType(type) {
        const cardSet = this.data.find((set) => set.name === type.name);
        if (cardSet === undefined) {
            console.error("couldn't find card-type: " + type);
            return undefined;
        }
        return cardSet.cards;
    }

    getAllCards() {
        return this.data.reduce((a, b) => a.concat(b), []);
    }

    getRandomCard(type, position, globalState) {
        const cards = this.getCardsByType(type);
        const boardLength = globalState.boardState.squares.length;

        let cardSet;
        if (cards === undefined || cards.length === 0) {
            cardSet = this.getAllCards();
        } else {
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

        if (cardSet.length === 1) {
            return cardSet[0];
        } else {
            let selected = [];
            do {
                const ran = Math.random();
                selected = cardSet.filter(card => ran < card.frequency);
            } while (selected.length === 0);

            const r = Math.random(new Date().getMilliseconds()) * selected.length;

            return selected[Math.floor(r)];
        }
    }
}
