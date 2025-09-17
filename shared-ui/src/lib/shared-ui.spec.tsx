import { render } from '@testing-library/react';

import RestaurantMonorepoSharedUi from './shared-ui';

describe('RestaurantMonorepoSharedUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RestaurantMonorepoSharedUi />);
    expect(baseElement).toBeTruthy();
  });
});
