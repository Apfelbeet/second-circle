import { BoardState } from "./BoardState";

export const GAME_STATUS = {
    PRE_INIT: 0,
    INIT: 1,
    LOADING: 2,
    TURN: 3,
    IN_TURN: 4,
    FINISHED: 5,
};

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
        this.players = players;
        this.gameStatus = gameStatus;
        this.currentPlayerIndex = currentPlayerIndex;
        this.dice = dice;
        this.boardState = boardState;
        this.deck = deck;
        this.onLoaded = onLoaded;
        this.activeCard = activeCard;
    }

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

    getIndexFromId(id) {
        let i;
        for (i = 0; i < this.players.length; i++) {
            if (id === this.players[i].id) {
                return i;
            }
        }
    }

    getPlayerById(id) {
        return this.players.find((ps) => ps.id === id);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getSquareByPlayer(player) {
        if (player === undefined || this.boardState === undefined) {
            console.error("couln't find square");
            return;
        }

        return this.boardState.squares[player.position];
    }

    withPlayer(playerState) {
        let x = this.copy();
        x.players.push(playerState);
        if (x.players.length >= 2 && x.gameStatus === GAME_STATUS.PRE_INIT) {
            x.gameStatus = GAME_STATUS.INIT;
        }
        return x;
    }

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

    withPlayerMove(id, newPosition, setGlobalState) {
        /*const sleep = (milliseconds) =>
            new Promise((resolve) => setTimeout(resolve, milliseconds));*/

        let pos = newPosition;
        if (pos < 0) pos = 0;
        else if (
            this.boardState !== undefined &&
            pos >= this.boardState.squares.length
        ) {
            pos = this.boardState.squares.length - 1;
        }

        let x = this.copy().withGameStatus(GAME_STATUS.IN_TURN);
        const player = x.getPlayerById(id);
        
        if (player === undefined) {
            console.warn("withPlayerMove() was called on an unkown player.");
            return x;
        }

        //setGlobalState(x);

        //let diff = pos - player.position;
        //const direction = diff > 0 ? 1 : -1;


        /*for (; diff > 0; diff--) {
            
            //console.log(x);
            //setGlobalState(x);
            //await sleep(200);
        }*/

        x.players = x.players.map((ps) => {
            if (ps.id === id) return ps.withPosition(pos);
            else return ps;
        });

        x = x.withDrawCard(x.getPlayerById(id));
        setGlobalState(x);

        return x;
    }

    withGameStatus(gameStatus) {
        let x = this.copy();
        x.gameStatus = gameStatus;
        return x;
    }

    withCurrentPlayer(currentPlayerIndex) {
        let x = this.copy();
        x.currentPlayerIndex = currentPlayerIndex;
        return x;
    }

    withNextCurrentPlayer() {
        let x = this.copy();

        x.currentPlayerIndex =
            (this.currentPlayerIndex + 1) % this.players.length;
        return x;
    }

    withDiceRoll() {
        let x = this.copy();
        x.dice = Math.floor(Math.random() * 6) + 1;
        return x;
    }

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

    withActiveCard(card) {
        let x = this.copy();
        x.activeCard = card;
        return x;
    }

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
