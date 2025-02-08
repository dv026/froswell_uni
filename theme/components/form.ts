export default {
    parts: ['container', 'requiredIndicator', 'helperText'],
    variants: {
        brand: {
            container: {
                display: 'flex',
                justifyContent: 'stretch',
                py: '5px'
            }
        },
        inline: {
            container: {
                display: 'flex',
                justifyContent: 'stretch',
                width: 'auto'
            }
        }
    },
    defaultProps: {
        spacing: 2
    }
};
