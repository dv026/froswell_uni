export interface ActiveCalculation {
    /**
     * Идентификатор расчета (ключ в кэше сервера для получения статуса по расчету)
     */
    key: string;

    /**
     * Название сценария
     */
    scenarioName: string;

    /**
     * Название подсценария. Если расчет в режиме адаптации (создание/улучшение), то null
     */
    subScenarioName: string;
}
