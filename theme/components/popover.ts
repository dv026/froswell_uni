export default {
    parts: ['popper', 'content', 'header', 'body', 'footer', 'arrow'],
    baseStyle: {},
    variants: {
        brand: {
            content: {
                padding: '8px',
                boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
                _focus: {
                    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)'
                }
            },
            header: {
                border: 'none'
            },
            footer: {
                border: 'none'
            }
        }
    },
    // The default size and variant values
    defaultProps: {
        variant: 'brand'
    }
};
