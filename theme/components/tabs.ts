export default {
    parts: ['tabs', 'tab', 'tabpanel'],
    baseStyle: {},
    variants: {
        brand: {
            tabs: {
                spacing: 8
            },
            tab: {
                textTransform: 'inherit',
                color: 'typo.primary',
                transition: 'all .25s',
                paddingLeft: 0,
                paddingRight: 0,
                marginRight: '25px',
                _selected: {
                    _before: {
                        bg: 'bg.brand',
                        border: '2px solid',
                        borderColor: 'bg.brand',
                        borderRadius: '4px',
                        content: `""`,
                        position: 'absolute',
                        top: '28px',
                        width: '100%'
                    }
                },
                _focus: {
                    boxShadow: 'none'
                },
                _hover: {
                    _before: {
                        bg: 'control.grey300',
                        border: '2px solid',
                        borderColor: 'control.grey300',
                        borderRadius: '4px',
                        content: `""`,
                        position: 'absolute',
                        top: '27px',
                        width: '100%'
                    }
                },
                _disabled: {
                    color: 'typo.secondary',
                    opacity: 0.5,
                    _before: {
                        content: 'none'
                    }
                },
                _before: {
                    content: 'none'
                }
            },
            tabpanel: {
                padding: 0,
                margin: 0
            }
        }
    },
    // The default size and variant values
    defaultProps: {
        variant: 'brand'
    }
};
