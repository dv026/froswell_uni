export class TabletColumn {
    public index: number;
    public label: string;
    public dataKey: string;
    public width: number;
    public visible?: boolean;
    public horizontal?: boolean;
    public range?: number[];
    public rangeStep?: number;
    public strokeColor?: string;
    public background?: string;
    public isProxy?: boolean;
    public isEfficiency?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public cellRenderer?: (renderer: any) => void;
}
