import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import * as Deck from "../card_logic/Deck";

function closeOverlay() {
    document.getElementById("overlay-new-game").style.display = "none";
}

const NewGame = ({ globalState, setGlobalState }) => {
    const [gameData, setGameData] = useState({ size: 7, decklist: [] });

    Deck.notifyAboutDecklist(() => {
        setGameData({
            size: gameData.size,
            deck:
                gameData.deck === undefined && Deck.getDeckList().length > 0
                    ? Deck.getDeckList()[0].name
                    : gameData.deck,
            decklist: Deck.getDeckList(),
        });
    });

    const onSubmit = (e) => {
        e.preventDefault();

        let x = globalState.reset().withBoardState(gameData.size);
        Deck.loadDeckFromName(gameData.deck, x, setGlobalState);
        setGlobalState(x);
        closeOverlay();
    };

    return (
        <div id="overlay-new-game" className="overlay">
            <FaTimes className="icon-btn close-btn" onClick={closeOverlay} />
            <form className="form" onSubmit={onSubmit}>
                <div className="form-control">
                    <div className="form-control">
                        <label>Deck</label>
                        <select
                            className="form-control"
                            id="decks"
                            name="decks"
                            onChange={(e) => {
                                setGameData({
                                    deck: e.target.value,
                                    size: gameData.size,
                                    decklist: gameData.decklist,
                                });
                            }}
                        >
                            {gameData.decklist.map((d) => (
                                <option value={d.name} key={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control">
                        <label>Board Size</label>
                        <select
                            className="form-control"
                            id="size"
                            name="size"
                            defaultValue={gameData.size}
                            onChange={(e) => {
                                setGameData({
                                    deck: gameData.deck,
                                    size: e.target.value,
                                    decklist: gameData.decklist,
                                });
                            }}
                        >
                            {[5, 6, 7, 8, 9, 10].map((s) => (
                                <option value={s} key={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input type="submit" value="Submit" />
                </div>
            </form>
        </div>
    );
};

export default NewGame;
