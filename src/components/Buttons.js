import { FaUserPlus, FaRegFile} from "react-icons/fa";

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
}

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
}

