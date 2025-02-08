export class InterwellConnection {
    public xWell: number;
    public yWell: number;
    public xNeighbor: number;
    public yNeighbor: number;

    public constructor(xWell: number, yWell: number, xNeighbor: number, yNeighbor: number) {
        this.xWell = xWell;
        this.yWell = yWell;
        this.xNeighbor = xNeighbor;
        this.yNeighbor = yNeighbor;
    }
}
