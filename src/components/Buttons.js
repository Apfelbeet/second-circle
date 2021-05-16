import { FaUserPlus, FaRegFile, FaEye, FaEyeSlash } from "react-icons/fa";

export const AddPlayerButton = ({ size }) => {
    return (
        <FaUserPlus
            className="button button-padding"
            size={size}
            onClick={() => {
                document.getElementById("overlay-add-player").style.display =
                    "block";
            }}
        />
    );
};

export const NewGameButton = ({ size }) => {
    return (
        <FaRegFile
            className="button button-padding"
            size={size}
            onClick={() => {
                document.getElementById("overlay-new-game").style.display =
                    "block";
            }}
        />
    );
};

export const HideBoardButton = ({ size, globalState, setGlobalState }) => {
    const icon = globalState.boardVisible ? (
        <FaEye
            className="button button-padding disappear-on-small"
            size={size}
            onClick={() => {
                setGlobalState(globalState.withBoardVisible(false));
            }}
        />
    ) : (
        <FaEyeSlash
            size={size}
            className="button button-padding disappear-on-small"
            onClick={() => {
                setGlobalState(globalState.withBoardVisible(true));
            }}
        />
    );

    return icon;
};
