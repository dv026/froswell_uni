import React from 'react';

interface RunCalculationProps {
    title: string;
    cleanAllData: boolean;
    onCleanChange: (x: boolean) => void;
    onRun: () => void;
}

export const RunCalculation: React.FC<RunCalculationProps> = () => (
    <></>
    // TODO: компонент Crescent удален как неиспользуемый. Удалить этот компонент после имплементации нового компонента
    //  с такой логикой
    // <Crescent className='kriging__runner runner' direction={CrescentDirectionEnum.Right} onClick={onRun}>
    //     <div className='runner__title'>
    //         {i18n.t(mainDict.kriging.calc)}
    //         <div>&gt;&gt;</div>
    //     </div>
    //
    //     <div className='runner__check'>
    //         <div className='runner__check-title'>{title}</div>
    //         <Checkbox isChecked={cleanAllData} onChange={e => onCleanChange(e.target.checked)} stopPropagation={true} />
    //     </div>
    // </Crescent>
);
