import { ROLE_PERMISSIONS } from './shared-types.js';

describe('ROLE_PERMISSIONS', () => {
  it('should have correct permissions for owner role', () => {
    expect(ROLE_PERMISSIONS.owner).toEqual([
      'VIEW_ORDERS',
      'UPDATE_ORDER_STATUS',
      'MANAGE_MENU',
      'VIEW_REPORTS',
      'MANAGE_STAFF',
      'PROCESS_PAYMENTS',
      'VIEW_CUSTOMER_DATA',
    ]);
  });
});
