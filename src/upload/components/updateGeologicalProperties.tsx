import React from 'react';

import { find } from 'ramda';

import { SelectPlast } from '../../common/components/selectPlast';
import { KeyValue } from '../../common/entities/keyValue';
import * as Prm from '../../common/helpers/parameters';
import { isNullOrEmpty, mapIndexed, shallow } from '../../common/helpers/ramda';
import { GeologicalProperties } from '../entities/geologicalProperties';
import { UpdateSingleParameter, UpdateSingleParameterProps } from './updateSingleParameter';

import css from '../UploadPage.module.less';

interface Parameter {
    dataKey: string;
    title: string;
}

const Properties: Parameter[] = [
    { dataKey: 'initialPressure', title: Prm.initialPressure() },
    { dataKey: 'bubblePointPressure', title: Prm.bubblePointPressure() },
    { dataKey: 'initialWaterSaturation', title: Prm.initialWaterSaturation() },
    { dataKey: 'residualOilSaturation', title: Prm.residualOilSaturation() },
    { dataKey: 'geologicalReserves', title: Prm.geologicalReserves() }
];

export interface UpdateGeologicalPropertiesProps {
    data: Array<GeologicalProperties>;
    plasts: Array<KeyValue>;
    onChange: (model: GeologicalProperties) => void;
}

interface UpdateGeologicalPropertiesState {
    activeModel: GeologicalProperties;
    activePlast: number;
}

export class UpdateGeologicalProperties extends React.PureComponent<
    UpdateGeologicalPropertiesProps,
    UpdateGeologicalPropertiesState
> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public constructor(props, context) {
        super(props, context);

        const plastId = isNullOrEmpty(this.props.plasts) ? null : this.props.plasts[0].id;

        this.state = {
            activeModel: this.findActualModel(plastId),
            activePlast: plastId
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

        return <UpdateSingleParameter key={`${index}_${this.state.activeModel.plastId}`} {...props} />;
    };

    private onChangePlast = (plastId: number) => {
        this.setState({
            activePlast: plastId,
            activeModel: this.findActualModel(plastId)
        });
    };

    private findActualModel = (plastId: number) => {
        return find(it => it.plastId === plastId, this.props.data) || new GeologicalProperties(plastId);
    };
}
