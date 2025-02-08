import React from 'react';

import i18n from 'i18next';

import { InputElement, InputElementProps } from '../inputElement';

import mainDict from '../../helpers/i18n/dictionary/main.json';

interface Props {
    disabled: boolean;
    show: boolean;
    min: number;
    step: number;
    max: number;
    onChange: (x) => void;
}

export const GridSettings: React.FC<Props> = (p: Props) => {
    if (!p.show) {
        return null;
    }

    return (
        <>
            <div className='actions-panel__curtain-param'>
                <div className='actions-panel__label'>{i18n.t(mainDict.common.step)}: </div>
                <div className='actions-panel__numeric'>
                    <InputElement {...mapIsolineStepProps(p)} />
                </div>
            </div>
            <div className='actions-panel__curtain-param'>
                <div className='actions-panel__label'>{i18n.t(mainDict.common.min)}: </div>
                <div className='actions-panel__numeric'>
                    <InputElement {...mapIsolineMinProps(p)} />
                </div>
            </div>
            <div className='actions-panel__curtain-param'>
                <div className='actions-panel__label'>{i18n.t(mainDict.common.max)}: </div>
                <div className='actions-panel__numeric'>
                    <InputElement {...mapIsolineMaxProps(p)} />
                </div>
            </div>
        </>
    );
};

const mapIsolineMaxProps = (p: Props): InputElementProps => ({
    onChange: value => p.onChange({ mapIsolineMax: +value }),
    value: p.max || 100,
    type: 'number',
    min: 0,
    step: p.step,
    disabled: p.disabled
});

const mapIsolineMinProps = (p: Props): InputElementProps => ({
    onChange: value => p.onChange({ mapIsolineMin: +value }),
    value: p.min || 0,
    type: 'number',
    min: 0,
    step: p.step,
    disabled: p.disabled
});

const mapIsolineStepProps = (p: Props): InputElementProps => ({
    onChange: value => p.onChange({ mapIsolineStep: +value }),
    value: p.step || 1,
    type: 'number',
    min: 0,
    step: p.step,
    disabled: p.disabled
});
