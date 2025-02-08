import colors from '../colors';

export default {
    parts: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption'],
    baseStyle: {},
    variants: {
        brand: {
            table: {
                fontSize: '12px',
                lineHeight: '16px',
                color: 'typo.primary'
            },
            thead: {
                bgColor: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 'docked'
            },
            th: {
                border: '1px solid',
                borderColor: colors.bg.brand,
                fontStyle: 'normal',
                fontWeight: 'bold',
                overflow: 'hidden',
                px: '8px',
                py: '12px',
                textOverflow: 'ellipsis',
                textTransform: 'none',
                '&:[data-is-numeric=true]': {
                    textAlign: 'end'
                }
            },
            td: {
                border: '1px solid',
                borderColor: colors.control.grey300,
                paddingInlineStart: 2,
                paddingInlineEnd: 2,
                paddingTop: 2,
                paddingBottom: 2,
                lineHeight: 5
            }
        }
    },
    defaultProps: {
        variant: 'brand'
    }
};
