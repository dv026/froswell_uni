import { shallow } from 'enzyme';
import React from 'react';

import { Expand } from '../../../src/common/components/expand/expand';

describe('Expand', () => {
    let wrapper;
    const setState: any = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    const q: any = (init: any) => [init, setState] as [any, any];
    useStateSpy.mockImplementation(q);

    beforeEach(() => {
        wrapper = shallow(<Expand />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders', () => {
        wrapper.find('.expand__latch-container').props().onClick();

        expect(wrapper.hasClass('expand')).toBeTruthy();
        expect(wrapper.hasClass('expand_collapsed')).toBeFalsy();

        expect(setState).toHaveBeenCalledTimes(1);
        expect(setState).toHaveBeenCalledWith(false);

        setTimeout(() => {
            expect(wrapper.hasClass('expand_collapsed')).toBeTruthy();
        });
    });
});
