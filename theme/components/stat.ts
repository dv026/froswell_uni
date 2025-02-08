export default {
    parts: ['label', 'number', 'icon', 'helpText', 'container'],
    baseStyle: {},
    variants: {
        brand: {
            number: {
                fontWeight: 'normal',
                fontSize: 'sm'
            },
            helpText: {
                marginBottom: 0
            },
            icon: {
                w: '12px',
                h: '12px'
            }
        }
    },
    defaultProps: {
        variant: 'brand'
    }
};
