import React, { FC, PureComponent, ReactElement } from 'react';

import { Box } from '@chakra-ui/react';
import { TooltipBox } from 'common/components/charts/tooltips/tooltipBox';
import { round2 } from 'common/helpers/math';
import { find, isNil } from 'ramda';
import { useTranslation, withTranslation, WithTranslation } from 'react-i18next';
import { TooltipProps } from 'recharts';
import { Payload } from 'recharts/types/component/DefaultTooltipContent';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

// TIP: из-за особенностей реализации recharts, невозможно использовать FC компоненты для отображения тултипа
class Tooltip extends PureComponent<TooltipProps<number, string> & WithTranslation> {
    public render(): ReactElement {
        if (!this.props.active) {
            return null;
        }

        const { label } = this.props;

        const isBest = this.props.payload ? this.props.payload[0].payload.isBest : false;

        return (
            <TooltipBox>
                <Box fontWeight='bolder'>{`${this.props.t(dict.proxy.errorsByType.tooltip.label)}: ${label}${
                    isBest ? '*' : ''
                }`}</Box>
                <Line {...find(x => x.dataKey === 'oilSMAPE', this.props.payload)}></Line>
                <Line {...find(x => x.dataKey === 'liquidSMAPE', this.props.payload)}></Line>
                <Line {...find(x => x.dataKey === 'pressureSMAPE', this.props.payload)}></Line>
                <Line {...find(x => x.dataKey === 'injectionSMAPE', this.props.payload)}></Line>
                <Line {...find(x => x.dataKey === 'bottomHolePressureSMAPE', this.props.payload)}></Line>
                <Line {...find(x => x.dataKey === 'researchSMAPE', this.props.payload)}></Line>
                <Line {...find(x => x.dataKey === 'watercutMAE', this.props.payload)}></Line>
            </TooltipBox>
        );
    }
}

const Line: FC<Payload<number, string>> = ({ color, dataKey, value }) => {
    const { t } = useTranslation();

    if (isNil(value) || isNil(dataKey)) {
        return null;
    }

    return (
        <Box display='flex' alignItems='center' p='4px 0' color={color}>
            <Box w='250px' display='flex' alignItems='center' paddingRight='8px'>
                {t(dict.proxy.errorsByType.tooltip[dataKey])}:
            </Box>
            <Box w='60px' paddingLeft='4px' display='flex' alignItems='center' fontWeight='bolder'>
                {round2(value)}
            </Box>
        </Box>
    );
};

export const ByTypeTooltip = withTranslation()(Tooltip);
