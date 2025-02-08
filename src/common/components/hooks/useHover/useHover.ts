import { MutableRefObject, useEffect, useRef, useState } from 'react';

export function useHover(): [MutableRefObject<unknown>, boolean] {
    const [value, setValue] = useState(false);

    const ref = useRef(null);

    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);

    useEffect(() => {
        const node = ref.current;
        if (node) {
            node.addEventListener('mouseenter', handleMouseOver);
            node.addEventListener('mouseleave', handleMouseOut);

            return () => {
                node.removeEventListener('mouseenter', handleMouseOver);
                node.removeEventListener('mouseleave', handleMouseOut);
            };
        }
        // TODO: проверить правильность частичного задания зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref.current]);

    return [ref, value];
}
