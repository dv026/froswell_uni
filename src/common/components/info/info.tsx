import React from 'react';

import { Box } from '@chakra-ui/react';
import ReactTooltip from 'react-tooltip';

import { InfoIcon } from '../customIcon/general';

import css from './info.module.less';

interface Props {
    tip: string;
    disabled?: boolean;
}

export const Info: React.FC<Props> = ({ tip, disabled }: Props) => (
    <>
        <Box className={css.info} data-tip={tip} data-for={tooltipId()} opacity={disabled ? 0.4 : 1}>
            <InfoIcon color='icons.grey' boxSize={7} />
        </Box>
        <ReactTooltip id={tooltipId()} className='info__tip' effect='solid' disable={disabled} />
    </>
);

const tooltipId = () => 'info-tooltip';
