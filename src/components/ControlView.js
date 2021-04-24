import React from "react";
import { FaDice } from "react-icons/fa";
import * as Icons from "react-icons/fa";
import { GAME_STATUS } from "../states/GlobalState";
import CardView from "./CardView";

const DICE_ICONS = ["FaDiceOne", "FaDiceTwo", "FaDiceThree", "FaDiceFour", "FaDiceFive", "FaDiceSix"]

const ControlView = ({ globalState, setGlobalState }) => {
    let style = {};
    if (globalState.gameStatus === GAME_STATUS.TURN) {
        const player = globalState.getCurrentPlayer();
        style = {
            color: player.getColor().white ? "var(--white)" : "var(--black)",
            backgroundColor: player.getColor().color,
        };
    } else if (globalState.activeCard !== undefined) {
        const card = globalState.activeCard;
        style = {
            color: card.source.getColor().white
                ? "var(--white)"
                : "var(--black)",
            backgroundColor: card.source.getColor().color,
        };
    }

    return (
        <div className="control-view" style={style}>
            <Content
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
        </div>
    );
};

const Content = ({ globalState, setGlobalState }) => {
    if (globalState.gameStatus === GAME_STATUS.LOADING) {
        return <Headline text="Loading" />;
    } else if (globalState.gameStatus === GAME_STATUS.TURN) {
        const turn_cp = globalState.getCurrentPlayer();

        return (
            <>
                <Headline text={turn_cp.name} />
                <div className="control-view-body">
                    <FaDice
                        className="button "
                        size={75}
                        onClick={() => onDiceRoll(globalState, setGlobalState)}
                    />
                </div>
            </>
        );
    } else if (globalState.gameStatus === GAME_STATUS.IN_TURN) {
        const inturn_cp = globalState.getCurrentPlayer();

        return (
            <>
                <Headline text={inturn_cp.name} diceResult={globalState.dice} iconName={ globalState.getSquareByPlayer(globalState.activeCard.source).type.icon}/>
                <CardView
                    card={globalState.activeCard}
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                />
            </>
        );
    }

    return <></>;
};

const Headline = ({ text = "", diceResult, iconName }) => {
    let diceView;
    if (diceResult === undefined) {
        diceView = <></>;
    } else {
        const DiceIconName = Icons[DICE_ICONS[diceResult-1]];
        diceView = <DiceIconName />;
    }

    let iconView;
    if (iconName === undefined || Icons[iconName] === undefined) {
        iconView = <></>;
    } else {
        const IconName = Icons[iconName];
        iconView = <IconName />;
    }

    return (
        <div className="control-view-headline">
            <div className = "control-view-headline-icon"> { iconView}</div>
            {text}
            <div className="control-view-headline-dice">{diceView}</div>
        </div>
    );
};

const onDiceRoll = (globalState, setGlobalState) => {
    let x = globalState.withDiceRoll();
    const cp = x.getCurrentPlayer();

    x = x.withPlayerMove(cp.id, cp.position + x.dice, setGlobalState);
    setGlobalState(x);
};

export default ControlView;
