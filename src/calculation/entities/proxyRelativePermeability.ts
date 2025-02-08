export class ProxyRelativePermeability {
    public saturation: number;
    public oilPhasePermeabilities: number;
    public waterPhasePermeabilities: number;
    public kernBuckleyLeverettFunction: number;
    public kroFact: number;
    public krwFact: number;
    public buckleyLeverettFunctionFact: number;
    public kroCalc: number;
    public krwCalc: number;
    public buckleyLeverettFunctionCalc: number;

    constructor(s: number) {
        this.saturation = s;
    }
}
