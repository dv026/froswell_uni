export default {
    parts: ['track', 'filledTrack', 'label'],
    baseStyle: {},
    variants: {
        brand: {
            track: {
                bg: 'bg.grey200'
            },
            filledTrack: {
                bg: 'icons.green'
            },
            label: {
                color: 'typo.primary'
            }
        }
    },
    sizes: {
        md: {
            track: {
                borderRadius: '5px',
                h: '10px'
            },
            label: {
                fontSize: '0.8rem'
            }
        },
        lg: {
            track: {
                borderRadius: '10px',
                h: '20px'
            },
            label: {
                fontSize: '1rem'
            }
        }
    },
    // The default size and variant values
    defaultProps: {
        variant: 'brand'
    }
};
