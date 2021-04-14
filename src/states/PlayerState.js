let ID = 0;

/**
 * List of all colors players can have.
 */
const PLAYER_COLORS = [
    "#F2545B", //red
    "#2274A5", //blue
    "#32936F", //green
    "#FF9000", //yellow
    "#870058", //purpble
    "#8C93A8", //gray
    "#06BEE1", //light blue

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