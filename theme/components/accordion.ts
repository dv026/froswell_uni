export default {
    parts: ['container', 'button', 'panel', 'icon'],
    baseStyle: {},
    variants: {
        brand: {
            container: {},
            button: {
                padding: '10px 0',
                _focus: {
                    boxShadow: 'none'
                }
            },
            panel: {
                padding: '0 0 10px'
            }
        },
        custom: {
            container: {
                border: 'none',
                margin: '0 -10px'
            },
            button: {
                background: 'bg.grey100',
                borderRadius: '3px',
                border: '1px solid',
                borderColor: 'control.grey300',
                padding: '2px 10px',
                _focus: {
                    boxShadow: 'none'
                },
                _expanded: {
                    background: 'none',
                    border: 'none'
                }
            },
            panel: {
                padding: '0 10px'
            }
        }
    },
    // The default size and variant values
    defaultProps: {
        variant: 'brand'
    }
};
