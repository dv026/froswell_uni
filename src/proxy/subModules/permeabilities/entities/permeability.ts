export class Permeability {
    public s: number;
    public kro: number;
    public krw: number;
    public fbl: number;
    public dfbl: number;

    public static create(s: number, kro: number, krw: number, fbl: number = 0, dfbl: number = 0): Permeability {
        let p = new Permeability();

        p.s = s;
        p.kro = kro;
        p.krw = krw;
        p.fbl = fbl;
        p.dfbl = dfbl;

        return p;
    }
}

export class PermeabilityChartModel {
    public s: number;
    public kro: number;
    public krw: number;
    public fbl: number;
    public dfbl: number;

    public kroKnown: number;
    public krwKnown: number;
    public fblKnown: number;
    public dfblKnown: number;

    public isKnown: boolean;

    public static knownFromEntity(raw: Permeability): PermeabilityChartModel {
        let p = new PermeabilityChartModel();

        p.s = raw.s;
        p.kro = raw.kro;
        p.krw = raw.krw;
        p.fbl = raw.fbl;
        p.dfbl = raw.dfbl;
        p.kroKnown = raw.kro;
        p.krwKnown = raw.krw;
        p.fblKnown = raw.fbl;
        p.dfblKnown = raw.dfbl;

        p.isKnown = true;

        return p;
    }

    public static newWithS(s: number): PermeabilityChartModel {
        let p = new PermeabilityChartModel();

        p.s = s;

        return p;
    }
}
