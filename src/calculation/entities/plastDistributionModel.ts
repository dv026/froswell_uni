export class PlastDistributionModel {
    public dt: Date;
    public details: PlastDetail[];

    public constructor(dt: Date, details: PlastDetail[]) {
        this.dt = dt;
        this.details = details;
    }
}

export class PlastDetail {
    public plastId: number;
    public plastName: string;
    public value: number;

    public constructor(id: number, name: string, value: number) {
        this.plastId = id;
        this.plastName = name;
        this.value = value;
    }
}
