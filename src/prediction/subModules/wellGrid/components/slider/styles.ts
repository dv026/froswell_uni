// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getStylesByType = (type: string) => {
    const common = {
        height: '40px',
        margin: '3px',
        boxSizing: 'content-box',
        cursor: 'pointer',
        position: 'absolute',
        zIndex: 3
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styles: { [index: string]: any } = {
        mark1_pressure: {
            ...common,
            width: '1px',
            backgroundColor: '#949495',
            left: `calc(${((561 - 100) / (1220 - 100)) * 100}% - 3.5px)`,
            top: `10%`,
            '&:before': {
                content: "'56.1'",
                color: '#949495',
                position: 'absolute',
                top: '-60%',
                left: '-1500%'
            }
        },

        mark2_pressure: {
            ...common,
            width: '4px',
            backgroundColor: '#E6B02F',
            left: `calc(${((802 - 100) / (1220 - 100)) * 100}% - 5px)`,
            top: `10%`,
            '&:before': {
                content: "'80.2'",
                color: '#E6B02F',
                position: 'absolute',
                bottom: '-60%',
                left: '-300%'
            }
        },

        mark1_skinFactor: {
            ...common,
            width: '4px',
            backgroundColor: '#000000',
            left: `calc(${((10 - 1) / (10 + 10)) * 100}% - 5px)`,
            top: `10%`,
            '&:before': {
                content: "'-1'",
                color: '#0E0B1F',
                position: 'absolute',
                top: '-60%',
                left: '-180%'
            }
        },

        mark2_skinFactor: {
            ...common,
            width: '1px',
            backgroundColor: '#949495',
            left: `calc(${((8 + 10) / (10 + 10)) * 100}% - 3.5px)`,
            top: `10%`,
            '&:before': {
                content: "'8'",
                color: '#6B6B6B',
                position: 'absolute',
                top: '-60%',
                left: '-400%'
            }
        }
    };

    return styles[type];
};
