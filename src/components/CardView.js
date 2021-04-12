import React from "react";
import { runOption } from "../card_logic/CardInterpreter";

const CardView = ({ card, globalState, setGlobalState }) => {
    let c = card;
    if (c === undefined) {
        c = { text: "", options: [], source: { name: "", getColor: () => {} } };
    }

    return (
        <>
            <div className="control-card-content control-card-card">
                <h3 className = "player-card" style={{backgroundColor: c.source.getColor()}}>{c.source.name}</h3>
                <div className="control-card-card-body">{c.text}</div>
            </div>
            <div className="control-card-content">
                {c.options.map((o) => (
                    <OptionButton
                        key={o.text}
                        option={o}
                        card_actions={c.actions}
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                    />
                ))}
            </div>
        </>
    );
};

const OptionButton = ({
    option,
    card_actions,
    globalState,
    setGlobalState,
}) => {
    return (
        <div
            className="control-card-option icon-btn"
            onClick={() => {
                onOption(option, card_actions, globalState, setGlobalState);
            }}
        >
            {option.text}
        </div>
    );
};

function onOption(option, cardActions, globalState, setGlobalState) {
    setGlobalState(
        runOption(globalState, setGlobalState, cardActions, option)
            //.withNextCurrentPlayer()
            //.withGameStatus(GAME_STATUS.TURN)
    );
}

export default CardView;
