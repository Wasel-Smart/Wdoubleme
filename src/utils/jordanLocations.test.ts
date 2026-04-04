import { describe, expect, it } from 'vitest';
import {
  buildJordanCorridorKey,
  getJordanRouteScope,
  routeEndpointsAreDistinct,
  routeMatchesLocationPair,
} from './jordanLocations';

describe('jordanLocations', () => {
  it('matches city to matching governorate endpoint', () => {
    expect(
      routeMatchesLocationPair('Amman', 'Aqaba', 'Amman Governorate', 'Aqaba', { allowReverse: false }),
    ).toBe(true);
  });

  it('does not treat two different cities in the same governorate as identical', () => {
    expect(routeEndpointsAreDistinct('Madaba', "Ma'in")).toBe(true);
  });

  it('blocks overlapping city to same-governorate searches', () => {
    expect(routeEndpointsAreDistinct('Amman', 'Amman Governorate')).toBe(false);
  });

  it('builds route scope for mixed city and governorate trips', () => {
    expect(getJordanRouteScope('Amman', 'Aqaba Governorate')).toBe('city_to_governorate');
    expect(getJordanRouteScope('Amman Governorate', 'Aqaba Governorate')).toBe('governorate_to_governorate');
  });

  it('normalizes corridor keys across city and governorate labels', () => {
    expect(buildJordanCorridorKey('Amman Governorate', 'Aqaba')).toBe('amman-governorate__aqaba');
  });
});
