import React, { PureComponent } from 'react';

import { Box, Input } from '@chakra-ui/react';
import i18n from 'i18next';
import { concat, filter, map, pipe } from 'ramda';

import { CheckList, CheckListOption } from '../../../common/components/checkList';
import { Dropdown, DropdownOption, DropdownProps } from '../../../common/components/dropdown/dropdown';
import { CalculationProgress } from '../../../common/components/kriging/calculationProgress';
import { Group } from '../../../common/components/kriging/krigingGroup';
import { Period } from '../../../common/components/kriging/period';
import { RunCalculation } from '../../../common/components/kriging/runCalculation';
import { VerticalSeparator } from '../../../common/components/separator/separator';
import { BatchIntervalEvent } from '../../../common/entities/batchIntervalEvent';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import * as Prm from '../../../common/helpers/parameters';
import { trueOrNull } from '../../../common/helpers/ramda';
import { cls } from '../../../common/helpers/styles';
import { KrigingCalcSettingsModel } from '../../entities/krigingCalcSettings';
import { PlastZoneEnum } from '../../enums/plastZoneEnum';
import { RestrictionEnum } from '../../enums/restrictionEnum';
import { VarioModelEnum } from '../../enums/varioModelEnum';

import css from './index.module.less';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface KrigingCalcSettingsProps {
    model: KrigingCalcSettingsModel;
    submit: (model: KrigingCalcSettingsModel) => void;
    abort: () => void;
    checkBatchStatus: (jobId) => void;
    clearBatchStatus: (setAborted: boolean) => void;
    onClose: () => void;
}

interface KrigingCalcSettingsState {
    innerModel: KrigingCalcSettingsModel;
    pressAbort: boolean;
    pressForceAbort: boolean;
}

export class KrigingCalcSettings extends PureComponent<KrigingCalcSettingsProps, KrigingCalcSettingsState> {
    private batchIntervalEvent: BatchIntervalEvent;

    public constructor(props: KrigingCalcSettingsProps, context: unknown) {
        super(props, context);

        this.state = {
            innerModel: this.props.model,
            pressAbort: false,
            pressForceAbort: false
        };

        this.batchIntervalEvent = new BatchIntervalEvent();
    }

    public componentWillUnmount(): void {
        this.batchIntervalEvent.stop();
    }

    public render(): React.ReactNode {
        const { varioModel, varioDegree, varioRadius, preliminaryCalcStep, krigingCalcStep, cleanAllData } =
            this.state.innerModel;

        const varioModelDropdown: DropdownProps = {
            // onChange: this.onVarioModelChange.bind(this),
            options: [new DropdownOption(VarioModelEnum.Power, i18n.t(dict.kriging.degree))],
            value: varioModel
        };

        this.batchIntervalEvent.activateBatchCache(
            this.props.model.batchStatus,
            `input_kriging_${this.props.model.productionObjectId}`,
            this.checkBatchStatus()
        );

        return (
            <div className={css.kriging}>
                <div className={css.kriging__title}>
                    <div>{i18n.t(dict.common.calcMap)}</div>
                </div>
                <div className={css.kriging__close} onClick={() => this.props.onClose()}>
                    <svg viewBox='0 0 100 100'>
                        <path d='M0,0 L100,100 M100,0 L0,100' />
                    </svg>
                </div>
                <div className={css.kriging__steps}>
                    <div
                        className={cls(
                            css.kriging__step,
                            trueOrNull(!!this.props.model.batchStatus, css.kriging__step_hidden)
                        )}
                    >
                        <Group text={i18n.t(dict.kriging.groups.selection)}>
                            <CheckList
                                className={css.kriging__checklist}
                                options={this.selectionData()}
                                onChange={(v, c) => this.onChangeSelectionData(v, c)}
                            />
                            <div className={css.kriging__columnSeparator}>
                                <VerticalSeparator />
                            </div>
                            <div className={css.kriging__column}>
                                <CheckList
                                    className={css.kriging__checklist}
                                    options={this.selectionDataWithMap()}
                                    onChange={(v, c) => this.onChangeSelectionData(v, c)}
                                />
                                <Box pl={'33px'}>
                                    <Period
                                        data={this.props.model.values.avgPressureZab}
                                        model={this.state.innerModel}
                                        show={this.state.innerModel.params.indexOf(GridMapEnum.PressureZab) >= 0}
                                        onChange={model => {
                                            this.setState({ innerModel: model });
                                        }}
                                    />
                                    {this.state.innerModel.params.indexOf(GridMapEnum.PressureZab) >= 0 ? (
                                        <div className={css.kriging__periodParam}>{Prm.pressureZab()}</div>
                                    ) : null}
                                </Box>
                            </div>
                        </Group>
                        <Group text={i18n.t(dict.kriging.groups.limitations)}>
                            <CheckList
                                className={css.kriging__checklist}
                                options={this.restrictions()}
                                onChange={(v, c) => this.onChangeRestrictions(v, c)}
                            />
                        </Group>
                        <Group text={i18n.t(dict.kriging.groups.plastZone)}>
                            <CheckList
                                className={css.kriging__checklist}
                                options={this.formationZones()}
                                onChange={(v, c) => this.onChangeFormationZones(v, c)}
                            />
                        </Group>
                        <Group text={i18n.t(dict.kriging.groups.kriging)}>
                            <div className={css.kriging__column}>
                                <div className={css.kriging__param}>
                                    <span className={css.kriging__paramName}>{i18n.t(dict.kriging.varioModel)}: </span>
                                    <Dropdown className={css.dropdown_wellTypes} {...varioModelDropdown} />
                                </div>
                                <div className={css.kriging__param}>
                                    <span className={css.kriging__paramName}>{i18n.t(dict.kriging.varioDegree)}: </span>
                                    <Input
                                        className={css.kriging__numeric}
                                        type='number'
                                        value={varioDegree}
                                        step={0.1}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            this.onChangeVarioDegree(+e.target.value)
                                        }
                                    />
                                </div>
                                <div className={css.kriging__param}>
                                    <span className={css.kriging__paramName}>{i18n.t(dict.kriging.varioRadius)}: </span>
                                    <Input
                                        className={css.kriging__numeric}
                                        type='number'
                                        value={varioRadius}
                                        step={1000}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            this.onChangeVarioRadius(+e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className={css.kriging__columnSeparator} />
                            <div className={css.kriging__column}>
                                <div className={css.kriging__param}>
                                    <span className={css.kriging__paramName}>
                                        {i18n.t(dict.kriging.preliminaryCalcStep)}:{' '}
                                    </span>
                                    <Input
                                        className={css.kriging__numeric}
                                        type='number'
                                        value={preliminaryCalcStep}
                                        step={100}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            this.onChangePreliminaryCalcStep(+e.target.value)
                                        }
                                    />
                                </div>
                                <div className={css.kriging__param}>
                                    <span className={css.kriging__paramName}>
                                        {i18n.t(dict.kriging.krigingCalcStep)}:{' '}
                                    </span>
                                    <Input
                                        className={css.kriging__numeric}
                                        type='number'
                                        value={krigingCalcStep}
                                        step={25}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            this.onChangeKrigingCalcStep(+e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </Group>
                        <RunCalculation
                            title={i18n.t(dict.kriging.cleanAllData)}
                            cleanAllData={cleanAllData}
                            onCleanChange={(x: boolean) => this.onChangeCheckBoxCleanAllData(x)}
                            onRun={() => this.calcKriging()}
                        />
                    </div>
                    <CalculationProgress
                        className={cls(css.kriging__step, css.kriging__step_calc)}
                        title={i18n.t(dict.kriging.calcMaps)}
                        //abortPressed={this.state.pressAbort}
                        //forceAbortPressed={this.state.pressForceAbort}
                        forceAbort={() => this.forceAbortKriging()}
                        abort={() => this.abortKriging()}
                        batch={this.props.model.batchStatus}
                        mapNames={this.getMapNames()}
                        goToMap={() => this.props.onClose()}
                        goToParams={() => this.props.clearBatchStatus(false)}
                    />
                </div>
            </div>
        );
    }

    private checkBatchStatus(): (jobId: number) => void {
        return (jobId: number) => this.props.checkBatchStatus(jobId);
    }

    private calcKriging() {
        this.props.submit(this.state.innerModel);
    }

    private abortKriging() {
        this.props.abort();
    }

    private forceAbortKriging() {
        this.batchIntervalEvent.stop();
        this.props.clearBatchStatus(true);
    }

    private selectionData(): Array<CheckListOption> {
        const getParams = (param: string) => {
            return this.state.innerModel.params.indexOf(param) >= 0;
        };

        return [
            new CheckListOption(
                i18n.t(dict.kriging.params.porosity),
                GridMapEnum.Porosity,
                getParams(GridMapEnum.Porosity)
            ),
            new CheckListOption(
                i18n.t(dict.kriging.params.permeability),
                GridMapEnum.Permeability,
                getParams(GridMapEnum.Permeability)
            ),
            new CheckListOption(i18n.t(dict.kriging.params.power), GridMapEnum.Power, getParams(GridMapEnum.Power)),
            new CheckListOption(i18n.t(dict.kriging.params.topAbs), GridMapEnum.TopAbs, getParams(GridMapEnum.TopAbs)),
            new CheckListOption(
                i18n.t(dict.kriging.params.bottomAbs),
                GridMapEnum.BottomAbs,
                getParams(GridMapEnum.BottomAbs)
            ),
            new CheckListOption(
                i18n.t(dict.kriging.params.oilSaturation),
                GridMapEnum.OilSaturation,
                getParams(GridMapEnum.OilSaturation)
            )
        ];
    }

    private getMapNames(): string[] {
        return pipe(
            filter<CheckListOption>(x => !!x.checked),
            map<CheckListOption, string>(x => x.text)
        )(concat(this.selectionData(), this.selectionDataWithMap()));
    }

    private selectionDataWithMap(): CheckListOption[] {
        const getParams = (param: string) => {
            return this.state.innerModel.params.indexOf(param) >= 0;
        };

        return [
            new CheckListOption(
                i18n.t(dict.kriging.params.pressureZab),
                GridMapEnum.PressureZab,
                getParams(GridMapEnum.PressureZab)
            )
        ];
    }

    private restrictions(): Array<CheckListOption> {
        return [
            new CheckListOption(
                i18n.t(dict.kriging.onlyInnerActiveContour),
                RestrictionEnum.OnlyInnerActiveContour,
                this.state.innerModel.onlyInnerActiveContour
            )
        ];
    }

    private formationZones(): Array<CheckListOption> {
        return [
            new CheckListOption(
                i18n.t(dict.kriging.zones.non),
                PlastZoneEnum.zoneNonCollector,
                this.state.innerModel.zoneNonCollector
            ),
            new CheckListOption(
                i18n.t(dict.kriging.zones.pureWater),
                PlastZoneEnum.zonePureWater,
                this.state.innerModel.zonePureWater
            ),
            new CheckListOption(
                i18n.t(dict.kriging.zones.waterOil),
                PlastZoneEnum.zoneWaterOil,
                this.state.innerModel.zoneWaterOil
            ),
            new CheckListOption(
                i18n.t(dict.kriging.zones.pureOil),
                PlastZoneEnum.zonePureOil,
                this.state.innerModel.zonePureOil
            )
        ];
    }

    private onChangeSelectionData(value: string, checked: boolean): void {
        let model = { ...this.state.innerModel };

        if (checked) model.params.push(value);
        else model.params.splice(model.params.indexOf(value), 1);

        this.setState({ innerModel: model });
    }

    private onChangeRestrictions(value: string, checked: boolean): void {
        let model = { ...this.state.innerModel };

        model.onlyInnerActiveContour = checked;

        this.setState({ innerModel: model });
    }

    private onChangeFormationZones(value: string, checked: boolean): void {
        let model = { ...this.state.innerModel };

        model[value] = checked;

        this.setState({ innerModel: model });
    }

    // private onVarioModelChange(e: React.ChangeEvent<HTMLSelectElement>) {}

    private onChangeVarioDegree(value: number) {
        let model = { ...this.state.innerModel };
        model.varioDegree = value;
        this.setState({ innerModel: model });
    }

    private onChangeVarioRadius(value: number) {
        let model = { ...this.state.innerModel };
        model.varioRadius = value;
        this.setState({ innerModel: model });
    }

    private onChangePreliminaryCalcStep(value: number) {
        let model = { ...this.state.innerModel };
        model.preliminaryCalcStep = value;
        this.setState({ innerModel: model });
    }

    private onChangeKrigingCalcStep(value: number) {
        let model = { ...this.state.innerModel };
        model.krigingCalcStep = value;
        this.setState({ innerModel: model });
    }

    private onChangeCheckBoxCleanAllData(value: boolean) {
        let model = { ...this.state.innerModel };
        model.cleanAllData = value;
        this.setState({ innerModel: model });
    }
}
