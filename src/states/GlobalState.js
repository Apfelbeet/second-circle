import { BoardState } from "./BoardState";

/**
 * The game can have different states:
 * PRE_INIT: When the game has less than 2 players.
 * INIT: More than 1 players but no board is initialize.
 * LOADING: While a board is initialized, the game has this state.
 * TURN: When a players turn starts and he has to roll the dice.
 * IN_TURN: After the player rolled the dice, the card will be displayed.
 * FINISHED: When a player reached the goal.
 */
export const GAME_STATUS = {
    PRE_INIT: 0,
    INIT: 1,
    LOADING: 2,
    TURN: 3,
    IN_TURN: 4,
    FINISHED: 5,
};

/**
 * The state of the game is stored in a GlobalState instance.
 * Each instance is read-only, every change will create a new instance.
 */
export class GlobalState {
    constructor(
        players = [],
        gameStatus = GAME_STATUS.PRE_INIT,
        currentPlayerIndex = 0,
        dice = 0,
        boardState = undefined,
        deck = undefined,
        onLoaded = undefined,
        activeCard = undefined
    ) {
        /**
         * List of all player states
         * @type {[*]}
         */
        this.players = players;

        /**
         * The current status.
         *
         * @type {number} This is a Enum (see GAME_STATUS).
         */
        this.gameStatus = gameStatus;

        /**
         * The index of the current player in this.players.
         * @type {number}
         */
        this.currentPlayerIndex = currentPlayerIndex;

        /**
         * Represents the last rolled number.
         * @type {number}
         */
        this.dice = dice;

        /**
         * The board state stores all squares states and some additional data
         * @type {BoardState}
         */
        this.boardState = boardState;

        /**
         * The deck the game uses to display cards.
         */
        this.deck = deck;

        /**
         * A function that will be called when a deck is fully received from the server.
         */
        this.onLoaded = onLoaded;

        /**
         * The active card will be displayed to the players.
         */
        this.activeCard = activeCard;
    }

    /**
     * Resting a gamestate will:
     * - reset the gamestatus
     * - move all players to the start
     * - set the first player as current player
     * - delete the current board
     * - delete the current active card
     * - delete the current deck
     *
     * @returns {GlobalState} new state
     */
    reset() {
        let x = this.copy();
        x.gameStatus =
            this.players.length >= 2 ? GAME_STATUS.INIT : GAME_STATUS.PRE_INIT;
        x.players = x.players.map((p) => p.withPosition(0));
        x.currentPlayerIndex = 0;
        x.boardState = undefined;
        x.activeCard = undefined;
        x.deck = undefined;
        return x;
    }

    /**
     * Creates copy with the same attributes.
     * TODO: Use a generic approach.
     *
     * @returns {GlobalState} copy of this state
     */
    copy() {
        return new GlobalState(
            this.players,
            this.gameStatus,
            this.currentPlayerIndex,
            this.dice,
            this.boardState,
            this.deck,
            this.onLoaded,
            this.activeCard
        );
    }

    /**
     * Returns the index in this.players of a player with the passed id.
     *
     * @param {number} id of the player
     * @returns {number | undefined} index or undefined if id is unknown.
     */
    getIndexFromId(id) {
        let i;
        for (i = 0; i < this.players.length; i++) {
            if (id === this.players[i].id) {
                return i;
            }
        }
    }

    /**
     * Returns the state of a player with the passed id.
     *
     * @param {*} id of the player
     * @returns {PlayerState}
     */
    getPlayerById(id) {
        return this.players.find((ps) => ps.id === id);
    }

    /**
     * Returns the state of the current player (whose turn it is)
     *
     * @returns {PlayerState}
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Uses a player state to determine the square he is on and returns it state-
     * @returns {SquareState | undefined} undefined when the players state or the board state is invalid.
     */
    getSquareByPlayer(player) {
        if (player === undefined || this.boardState === undefined) {
            console.error("couln't find square");
            return;
        }

        return this.boardState.squares[player.position];
    }

    /**
     * Creates a new state with an extra player added.
     *
     * @param {PlayerState} playerState: the new player.
     * @returns {GlobalState} new game state.
     */
    withPlayer(playerState) {
        let x = this.copy();
        x.players.push(playerState);
        if (x.players.length >= 2 && x.gameStatus === GAME_STATUS.PRE_INIT) {
            x.gameStatus = GAME_STATUS.INIT;
        }
        return x;
    }

    /**
     * Creates a new state with a player removed.
     *
     * @param {*} id of the player to remove
     * @returns {GlobalState}
     */
    withPlayerRemove(id) {
        let x = this.copy();
        x.players = this.players.filter((s) => s.id !== id);

        if (x.players.length > 0)
            x.currentPlayerIndex = x.currentPlayerIndex % x.players.length;
        else x.currentPlayerIndex = 0;

        if (x.players.length < 2) {
            x.gameStatus = GAME_STATUS.PRE_INIT;
        }

        return x;
    }

    /**
     * creates new state with an player moved to another square (or the same square ;) ).
     * Any position that isn't in the bounds of the board, will be replaced by the nearst number in bound.
     *
     * this function also sets the this.gameStatus to the right phase
     * and uses setGlobalState() to display the move before other gameevents are raised.
     * If you don't want to set a new globalstate, you can pass a empty function or omit the setGlobalState argument.
     *
     * TODOs:
     * 1. The use of setGloablState within this function, is a dirty approach of using the state system.
     * It makes sense later to divide the state functions into clean function, that edit the gamestate,
     * and utility functions, that are using these state functions to offer an uniformal way of performing complex state changes.
     *
     * 2. Animation: The current state system doesn't allow any kind of animation, but they would be neat.
     *
     * @param {number} id of the player
     * @param {number} newPosition the new position
     * @param {*} setGlobalState function that will set the state.
     * @returns {GlobalState}
     */
    withPlayerMove(id, newPosition, setGlobalState = () => {}) {
        //Postion out of bounds are replaced with 0 or the largest position.
        let pos = newPosition;
        if (pos < 0) pos = 0;
        else if (
            this.boardState !== undefined &&
            pos >= this.boardState.squares.length
        ) {
            pos = this.boardState.squares.length - 1;
        }

        //shouldn't be here
        let x = this.copy().withGameStatus(GAME_STATUS.IN_TURN);
        
        const player = x.getPlayerById(id);

        if (player === undefined) {
            console.warn("withPlayerMove() was called on an unkown player.");
            return x;
        }

        x.players = x.players.map((ps) => {
            if (ps.id === id) return ps.withPosition(pos);
            else return ps;
        });

        //shouldn't be here
        setGlobalState(x);
        //shouldn't be here
        x = x.withDrawCard(x.getPlayerById(id));

        return x;
    }

    /**
     * creates new state with another game status.
     * 
     * @param {GAME_STATUS} gameStatus 
     * @returns {GlobalState}
     */
    withGameStatus(gameStatus) {
        let x = this.copy();
        x.gameStatus = gameStatus;
        return x;
    }

    /**
     * creates new state with a new current player.
     * 
     * @param {number} currentPlayerIndex 
     * @returns {GlobalState}
     */
    withCurrentPlayer(currentPlayerIndex) {
        let x = this.copy();
        x.currentPlayerIndex = currentPlayerIndex;
        return x;
    }

    /**
     * creates a new state with the chronological next player as current player.
     * 
     * @returns {GlobalState}
     */
    withNextCurrentPlayer() {
        let x = this.copy();

        x.currentPlayerIndex =
            (this.currentPlayerIndex + 1) % this.players.length;
        return x;
    }

    /**
     * creates a new state with a new random dice value
     * 
     * @returns {GlobalState}
     */
    withDiceRoll() {
        let x = this.copy();
        x.dice = Math.floor(Math.random() * 6) + 1;
        return x;
    }

    /**
     * creates new state with a new board state of a custom size.
     * It also changes the gamestatus to the right phase:
     *  - if a deck is loaded, a new game is started.
     *  - in case there is no deck loaded, it will change the state to LOADING
     *    an registers a callback function, that will automaticlly recall this function onces the deck is loaded.
     * 
     * TODO: This function contains dirty code: state manipulating functions shouldn't use other state manipulation functions. 
     * 
     * @param {number} size 
     * @returns {GlobalState}
     */
    withBoardState(size) {
        let x = this.copy();
        x.boardSize = size;
        if (this.deck !== undefined) {
            x.boardState = new BoardState(size, this.deck);

            if (
                x.gameStatus === GAME_STATUS.INIT ||
                x.gameStatus === GAME_STATUS.LOADING
            )
                x = x.withGameStatus(GAME_STATUS.TURN);
        } else {
            if (x.gameStatus === GAME_STATUS.INIT) {
                x = x.withGameStatus(GAME_STATUS.LOADING);
                x.onLoaded = (globalState) => {
                    return globalState.withBoardState(size);
                };
            }
        }
        return x;
    }

    /**
     * Creates new deck with a new deck set.
     * 
     * @param {Deck} deck 
     * @returns {GlobalState}
     */
    withDeck(deck) {
        let x = this.copy();

        if (deck === undefined) {
            if (x.gameStatus === GAME_STATUS.LOADING) {
                x = x.withGameStatus(GAME_STATUS.INIT);
            }
        } else {
            x.deck = deck;

            if (x.onLoaded !== undefined) {
                x = x.onLoaded(x);
                x.onLoaded = undefined;
            }
        }
        return x;
    }

    /**
     * Creates new state with a new active card.
     * 
     * @param {*} card 
     * @returns {GlobalState}
     */
    withActiveCard(card) {
        let x = this.copy();
        x.activeCard = card;
        return x;
    }

    /**
     * Function that raises the onArrive event of the square the passed player stands.
     * This event can change the gamestate.
     *  
     * 
     * @param {PlayerState} player 
     * @returns {GlobalState} new state
     */
    withDrawCard(player) {
        if (
            player === undefined ||
            this.boardState === undefined ||
            this.deck === undefined
        ) {
            console.error("couln't draw card");
            return;
        }
        const x = this.boardState.squares[player.position].onArrive(
            this,
            player
        );
        return x;
    }
}
