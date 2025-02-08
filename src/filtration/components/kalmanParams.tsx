import React from 'react';

import i18n from 'i18next';

import { Dropdown } from '../../common/components/dropdown/dropdown';
import { InputElement } from '../../common/components/inputElement';
import { CalcModelEnum } from '../enums/calcModelEnum';
import { MethodEnum } from '../enums/methodEnum';

import css from '../index.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

// TODO: вывести типы из примера использования
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class KalmanParams extends React.PureComponent<any, null> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public constructor(props: any, context: unknown) {
        super(props, context);
    }

    public render(): JSX.Element {
        return (
            <>
                {this.props.objects.options.length && this.props.objects.options.length > 1 ? (
                    <div className={css.filtration__param}>
                        <span>{i18n.t(dict.common.object)}:</span>
                        <Dropdown
                            {...this.props.objects}
                            disabled={this.props.objects.options.length === 1 ? 'disabled' : null}
                        />
                    </div>
                ) : null}
                {this.props.wellTypes.options.length && this.props.wellTypes.options.length > 1 ? (
                    <div className={css.filtration__param}>
                        <span>{i18n.t(dict.filtration.charWork)}:</span>
                        <Dropdown
                            {...this.props.wellTypes}
                            disabled={this.props.wellTypes.options.length === 1 ? 'disabled' : null}
                        />
                    </div>
                ) : null}
                <div className={css.filtration__param}>
                    <span>{i18n.t(dict.filtration.calcMethod)}:</span>
                    <Dropdown className={css.filtration__param} {...this.props.methods} />
                </div>
                {this.props.model.method === MethodEnum.Kalman && (
                    <div className={css.filtration__param}>
                        <span>{i18n.t(dict.filtration.modelSelection)}</span>
                        <Dropdown {...this.props.calcModels} />
                    </div>
                )}
                <div className={css.filtration__param}>
                    <span>{i18n.t(dict.common.parameter)}</span>
                    <Dropdown {...this.props.inputParams} />
                </div>
                {this.props.model.method === MethodEnum.Kalman ? (
                    <>
                        <div className={css.filtration__param}>
                            <span>{i18n.t(dict.filtration.systemNoise)}</span>
                            <InputElement
                                type='number'
                                step={0.1}
                                min={0}
                                value={this.props.model.qt}
                                onChange={this.props.onQtChange.bind(this)}
                            />
                        </div>
                        <div className={css.filtration__param}>
                            <span>{i18n.t(dict.filtration.measurementNoise)}</span>
                            <InputElement
                                type='number'
                                step={50}
                                min={0}
                                value={this.props.model.rt}
                                onChange={this.props.onRtChange.bind(this)}
                            />
                        </div>
                        <div className={css.filtration__param}>
                            <span>{i18n.t(dict.filtration.errorVariance)}</span>
                            <InputElement
                                type='number'
                                step={1000}
                                min={0}
                                value={this.props.model.defaultPt}
                                onChange={this.props.onDefaultPtChange.bind(this)}
                            />
                        </div>
                        {this.props.model.calcModel === CalcModelEnum.Variable && (
                            <>
                                <div className={css.filtration__param}>
                                    <span>{i18n.t(dict.filtration.discrete)} Q1</span>
                                    <InputElement
                                        value={this.props.model.discreteQ1}
                                        onChange={this.props.onDiscreteQ1Change.bind(this)}
                                    />
                                </div>
                                <div className={css.filtration__param}>
                                    <span>{i18n.t(dict.filtration.discrete)} Q2</span>
                                    <InputElement
                                        value={this.props.model.discreteQ2}
                                        onChange={this.props.onDiscreteQ2Change.bind(this)}
                                    />
                                </div>
                                <div className={css.filtration__param}>
                                    <span>{i18n.t(dict.filtration.discrete)} Q3</span>
                                    <InputElement
                                        value={this.props.model.discreteQ3}
                                        onChange={this.props.onDiscreteQ3Change.bind(this)}
                                    />
                                </div>
                                <div className={css.filtration__param}>
                                    <span>{i18n.t(dict.filtration.discrete)} Q4</span>
                                    <InputElement
                                        value={this.props.model.discreteQ4}
                                        onChange={this.props.onDiscreteQ4Change.bind(this)}
                                    />
                                </div>
                            </>
                        )}
                    </>
                ) : this.props.model.method === MethodEnum.Slide ? (
                    <>
                        <div className={css.filtration__param}>
                            <span>{i18n.t(dict.filtration.smoothingAmount)}:</span>
                            <InputElement
                                type='number'
                                step={10}
                                max={1000}
                                value={this.props.model.smoothLevel}
                                onChange={this.props.onSmoothLevelChange.bind(this)}
                            />
                        </div>
                    </>
                ) : null}

                <div className={css.filtration__buttons}>
                    <div className='button button_calc' onClick={this.props.save}>
                        {i18n.t(dict.filtration.saveCalculation)}
                    </div>
                    <div className='button button_open' onClick={this.props.savedResult}>
                        {this.props.showSavedChecked
                            ? i18n.t(dict.common.close)
                            : i18n.t(dict.filtration.openSavedCalculation)}
                    </div>
                </div>
            </>
        );
    }
}
