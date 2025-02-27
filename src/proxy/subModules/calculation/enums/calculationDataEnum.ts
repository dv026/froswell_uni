export enum CalculationDataEnum {
    // отображаются уже сохраненные данные
    Open = 1,

    // отображаются только что рассчитанные на сервере данные, ЕЩЕ НЕ сохраненные
    Create = 2,

    // отображаются только что рассчитанные на сервере данные, УЖЕ сохраненные
    Saved = 3,

    // отображаются уже сохраненные данные по INSIM модели
    OpenINSIM = 4
}
