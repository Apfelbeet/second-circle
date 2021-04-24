import Header from "./components/Header";
import { GlobalState } from "./states/GlobalState";
import PlayerRow from "./components/PlayerRow";
import { useState } from "react";
import AddPlayer from "./components/AddPlayer";
import NewGame from "./components/NewGame";
import GameView from "./components/GameView";
import * as Deck from "./card_logic/Deck";

function App() {
    Deck.loadDecklist();

    const [globalState, setGlobalState] = useState(new GlobalState());
    return (
        <>
            <AddPlayer
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
            <NewGame
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
            <div className="screen">
                <Header
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                />
                <div className="body-grid">
                    <PlayerRow
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                        top={true}
                    />
                    <GameView
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                    />
                    <PlayerRow
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                        top={false}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
