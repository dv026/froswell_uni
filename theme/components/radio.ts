export default {
    parts: ['container', 'control', 'label'],
    baseStyle: {
        container: {
            _hover: {
                cursor: 'pointer'
            }
        },
        control: {
            _focus: {
                boxShadow: 'none'
            }
        }
    },
    sizes: {
        md: {
            control: {
                width: '16px',
                height: '16px'
            }
        }
    },
    defaultProps: {
        colorScheme: 'brand'
    }
};
