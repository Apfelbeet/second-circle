import React from "react";
import { FaUserPlus, FaRegFile, FaDice } from "react-icons/fa";
import { GAME_STATUS } from "../states/GlobalState";
import CardView from "./CardView";

const ControlView = ({ globalState, setGlobalState }) => {
    return (
        <div className="control-view">
            <div className="control-card">
                <div className="control-card-header">
                    <div className="control-card-header-right">
                        {addPlayerButton(30)}
                        {newGameButton(globalState, setGlobalState, 30)}
                    </div>
                </div>
                <Content
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                />
            </div>
        </div>
    );
};

const Content = ({ globalState, setGlobalState }) => {
    if (globalState.gameStatus === GAME_STATUS.PRE_INIT) {
        return (
            <div className="control-card-big-button control-card-content">
                {addPlayerButton(150)}
                <div>Add player</div>
            </div>
        );
    } else if (
        globalState.gameStatus === GAME_STATUS.INIT ||
        globalState.gameStatus === GAME_STATUS.FINISHED
    ) {
        return (
            <div className="control-card-big-button control-card-content">
                {newGameButton(globalState, setGlobalState, 150)}
                <div>Start new game</div>
            </div>
        );
    } else if (globalState.gameStatus === GAME_STATUS.LOADING) {
        return <div className="control-card-content">Loading</div>;
    } else if (globalState.gameStatus === GAME_STATUS.TURN) {
        const turn_cp =  globalState.getCurrentPlayer()
        
        return (
            <div className="control-card-grid">
                <div className="control-card-content">
                    <span className="player-card" style= {{backgroundColor: turn_cp.getColor()}}>{turn_cp.name}</span>'s turn:
                </div>
                <div className="control-card-dice">
                    <FaDice
                        className="icon-btn icon-btn-padding control-card-content"
                        size={75}
                        onClick={() => onDiceRoll(globalState, setGlobalState)}
                    />
                </div>

                <CardView />
            </div>
        );
    } else if (globalState.gameStatus === GAME_STATUS.IN_TURN) {
        const inturn_cp =  globalState.getCurrentPlayer()
        
        return (
            <div className="control-card-grid">
                <div className="control-card-content">
                    <span className="player-card" style= {{backgroundColor: inturn_cp.getColor()}}>{inturn_cp.name}</span>'s turn:
                </div>
                <div className="control-card-content">{globalState.dice}</div>
                <CardView
                    card={globalState.activeCard}
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                />
            </div>
        );
    } else {
        return (
            <div className="control-card-big-button control-card-content">
                {newGameButton(globalState, setGlobalState, 150)}
            </div>
        );
    }
};

const addPlayerButton = (size = 30) => {
    return (
        <FaUserPlus
            className="icon-btn icon-btn-padding"
            size={size}
            onClick={() => {
                document.getElementById("overlay-add-player").style.display =
                    "block";
            }}
        />
    );
};

const newGameButton = (globalState, setGlobalState, size = 30) => {
    return (
        <FaRegFile
            className="icon-btn icon-btn-padding"
            size={size}
            onClick={() => {
                document.getElementById("overlay-new-game").style.display =
                    "block";
            }}
        />
    );
};

const onDiceRoll = (globalState, setGlobalState) => {
    let x = globalState.withDiceRoll();
    const cp = x.getCurrentPlayer();

    x = x.withPlayerMove(cp.id, cp.position + x.dice, setGlobalState);
    setGlobalState(x);
};

export default ControlView;
