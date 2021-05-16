import React from "react";
import { runOption } from "../card_logic/CardInterpreter";
import { GAME_STATUS } from "../states/GlobalState";

const CardView = ({ card, globalState, setGlobalState }) => {

    return (
        <>
            <div className="control-view-body">
                {card.text}
            </div>
            <div className="control-view-options">
                {globalState.gameStatus === GAME_STATUS.FINISHED ?
                    []
                    : card.options.map((o) => (
                    <OptionButton
                        key={o.text}
                        option={o}
                        card_actions={card.actions}
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
            className="control-view-option button"
            key={option.text}
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
