import React, { PureComponent } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import i18n from 'i18next';
import { find, map } from 'ramda';

import { SelectPlast } from '../../common/components/selectPlast';
import { KeyValue } from '../../common/entities/keyValue';
import { SaturationType } from '../../common/entities/saturationType';
import * as Prm from '../../common/helpers/parameters';
import { isNullOrEmpty, mapIndexed, shallow } from '../../common/helpers/ramda';
import { PhysicalProperties } from '../entities/physicalProperties';
import { UpdateSingleParameter, UpdateSingleParameterProps } from './updateSingleParameter';

import css from '../UploadPage.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

interface Parameter {
    dataKey: string;
    title: string;
}

const Properties: Parameter[] = [
    { dataKey: 'viscosity', title: Prm.viscosity() },
    { dataKey: 'conversionFactor', title: Prm.conversionFactor() },
    { dataKey: 'compressibility', title: Prm.compressibility() },
    { dataKey: 'density', title: Prm.density() }
];

const Saturation: KeyValue[] = [
    new KeyValue(SaturationType.Oil, i18n.t(dict.common.oil)),
    new KeyValue(SaturationType.Water, i18n.t(dict.common.water))
];

export interface UpdatePhysicalPropertiesProps {
    data: Array<PhysicalProperties>;
    plasts: Array<KeyValue>;
    onChange: (model: PhysicalProperties) => void;
}

interface UpdatePhysicalPropertiesState {
    activeModel: PhysicalProperties;
    activePlast: number;
    activeSaturation: SaturationType;
}

export class UpdatePhysicalProperties extends PureComponent<
    UpdatePhysicalPropertiesProps,
    UpdatePhysicalPropertiesState
> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public constructor(props, context) {
        super(props, context);

        const plastId = isNullOrEmpty(this.props.plasts) ? null : this.props.plasts[0].id;
        const saturationType = SaturationType.Oil;

        this.state = {
            activeModel: this.findActualModel(plastId, saturationType),
            activePlast: plastId,
            activeSaturation: saturationType
        };
    }

    public render(): JSX.Element {
        if (isNullOrEmpty(this.props.plasts)) {
            return null;
        }

        return (
            <div className={css.main__content}>
                <SelectPlast
                    dictionary={this.props.plasts}
                    selected={this.state.activePlast}
                    onChange={id => this.onChangePlast(id)}
                />
                <ButtonGroup spacing='4' variant='tabUnderline'>
                    {map(
                        it => (
                            <Button
                                key={it.id}
                                isActive={it.id === this.state.activeSaturation}
                                onClick={() => this.onChangeSaturation(it.id)}
                            >
                                {it.name}
                            </Button>
                        ),
                        Saturation
                    )}
                </ButtonGroup>
                {mapIndexed((it: Parameter, index: number) => this.renderParameter(it, index), Properties)}
            </div>
        );
    }

    private renderParameter = (p: Parameter, index: number) => {
        const props: UpdateSingleParameterProps = {
            title: p.title,
            value: this.state.activeModel[p.dataKey],
            onChange: (value: number) => {
                this.props.onChange(shallow(this.state.activeModel, { [p.dataKey]: value }));
            }
        };

        return (
            <UpdateSingleParameter
                key={`${index}_${this.state.activeModel.plastId}_${this.state.activeModel.saturationType}`}
                {...props}
            />
        );
    };

    private onChangePlast = (plastId: number) => {
        this.setState({
            activePlast: plastId,
            activeModel: this.findActualModel(plastId, this.state.activeSaturation)
        });
    };

    private onChangeSaturation = (type: SaturationType) => {
        this.setState({ activeSaturation: type, activeModel: this.findActualModel(this.state.activePlast, type) });
    };

    private findActualModel = (plastId: number, type: SaturationType) => {
        return (
            find(it => it.plastId === plastId && it.saturationType === type, this.props.data) ||
            new PhysicalProperties(plastId, type)
        );
    };
}
