let ID = 0;

/**
 * List of all colors players can have.
 */
const PLAYER_COLORS = [
    //red
    {
        color: "#F2545B",
        white: false,
    },
    //blue
    {
        color: "#2274A5",
        white: true,
    },
    //green
    {
        color: "#32936F",
        white: true,
    },
    //yellow
    {
        color: "#FF9000",
        white: false,
    },
    //purple
    {
        color: "#870058",
        white: true,
    },
    //gray
    {
        color: "#8C93A8",
        white: true,
    },
    //light blue
    {
        color: "#06BEE1",
        white: true,
    },

]

export class PlayerState {
    
    constructor(name, id = next(), position = 0) {
        this.id = id;
        this.name = name;
        this.position = position;
    }

    getColor() {
        return color(this.id)
    }

    copy() {
        return new PlayerState(this.name, this.id, this.position);
    }

    /**
     * change position of player
     * 
     * @param {number} position 
     * @returns {PlayerState}
     */
    withPosition(position) {
        let x = this.copy();
        x.position = position;
        return x;
    }
}

function color(id) {
    return PLAYER_COLORS[id % PLAYER_COLORS.length];
}

function next() {
    return ID++;
} 