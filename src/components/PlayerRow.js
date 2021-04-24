import { FaTimes } from "react-icons/fa";

const PlayerRow = ({ globalState, setGlobalState, top }) => {
    let playersDisplayed;
    if (globalState.players.length <= 3) {
        playersDisplayed = top ? globalState.players : [];
    } else {
        playersDisplayed = globalState.players.filter(
            (_, index) => (index < globalState.players.length / 2) === top
        );
    }

    return (
        <div className="player-row">
            {playersDisplayed.map((s) => {
                return (
                    <Player
                        key={s.id}
                        playerState={s}
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                    />
                );
            })}
        </div>
    );
};

const Player = ({ playerState, globalState, setGlobalState }) => {
    const removePlayer = () => {
        setGlobalState(globalState.withPlayerRemove(playerState.id));
    };

    const style = {
        backgroundColor: playerState.getColor().color,
        color: playerState.getColor().white ? "var(--white)" : "var(--black)",
    };

    return (
        <div className="player-row-entry" style={style}>
            <div className="player-row-entry-score">{playerState.position}</div>
            <div className="player-row-entry-text">{playerState.name}</div>
            <FaTimes
                className="button"
                style={{ marginLeft: "5px", paddingTop: "4px" }}
                onClick={removePlayer}
            />
            {/*<span className="tooltiptext">
                        Remove Player
                    </span>*/}
        </div>
    );
};

export default PlayerRow;
