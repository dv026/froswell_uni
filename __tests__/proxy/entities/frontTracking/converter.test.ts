import { convert } from '../../../../src/proxy/entities/frontTracking/converter';
import { FrontTracking } from '../../../../src/proxy/entities/frontTracking/frontTracking';

describe('convert function', () => {
    let raw: FrontTracking;

    beforeEach(() => {
        raw = {
            wellId: 1,
            neighbors: [
                {
                    neighborWellId: 1,
                    plastId: 1,
                    dates: [
                        {
                            byDistance: [],
                            date: ('2020-01-01T00:00:00.000Z' as unknown) as Date
                        }
                    ]
                }
            ]
        };
    });

    it('should replace with json date strings with date objects', () => {
        const shaped = convert(raw);

        expect(shaped.neighbors[0].dates[0].date instanceof Date);
    });

    it("should change raw object's properties inline", () => {
        const shaped = convert(raw);
        expect(raw).toBe(shaped);
    });
});
