import { SaturationType } from '../../common/entities/saturationType';

export class PhysicalProperties {
    public plastId: number;
    public saturationType: SaturationType;
    public viscosity: number; // Вязкость
    public conversionFactor: number; // Объемный коэффициент
    public compressibility: number; // Сжимаемость
    public density: number; // Плотность

    public constructor(plastId: number, saturationType: SaturationType) {
        this.plastId = plastId;
        this.saturationType = saturationType;
        this.viscosity = 0;
        this.conversionFactor = 0;
        this.compressibility = 0;
        this.density = 0;
    }
}
