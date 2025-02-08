import React from 'react';

import * as ReactDOM from 'react-dom';
import * as SvgAsPng from 'save-svg-as-png';

import { ddmmyyyy } from './date';

// TODO: проверить неиспользуемые параметры
export const ExportSvgToPng = (
    name: string,
    width: number,
    height: number,
    koff: number,
    body: JSX.Element,
    container: Element,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selector: JSX.Element
): void => {
    const maxRate = 1 / koff;

    let element: JSX.Element = (
        <svg
            key={`svg_export_${name}`}
            width={width}
            height={height}
            fontFamily={'Inter'}
            viewBox={`0 0 ${width} ${height}`}
            version='1.1'
            xmlns={'http://www.w3.org/2000/svg'}
            xmlnsXlink='http://www.w3.org/1999/xlink'
        >
            <g key={'export'} transform={`matrix(${maxRate},0,0,${maxRate},0,0)`} />
        </svg>
    );

    // start a new React render tree with the container and the cards
    // passed in from above, this is the other side of the portal.
    ReactDOM.render(element, container);

    SvgAsPng.saveSvgAsPng(
        // TODO: проверить правильность использования this в функции
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.exportElement.current.children['0'].children['0'].children['0'].children['0'],
        `${name}_${ddmmyyyy(new Date())}.png`,
        {
            fonts: [
                {
                    text: "@font-face{ font-family: 'Inter'; src:url(../fonts/exo2/Exo2-Regular.ttf); format('svg')}",
                    url: '/fonts/exo2/Exo2-Regular.ttf'
                }
            ]
        }
    );
};
