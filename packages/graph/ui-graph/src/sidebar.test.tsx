import Sidebar from './sidebar';
import { render, screen } from '@testing-library/react';
import { ComponentPropsWithoutRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Package } from '@commonalityco/types';
import userEvent from '@testing-library/user-event';

const renderSidebar = (props: {
  initialSearch: ComponentPropsWithoutRef<typeof Sidebar>['initialSearch'];
  visiblePackages: ComponentPropsWithoutRef<typeof Sidebar>['visiblePackages'];
  packages: ComponentPropsWithoutRef<typeof Sidebar>['packages'];
  tagsData: ComponentPropsWithoutRef<typeof Sidebar>['tagsData'];
  codeownersData: ComponentPropsWithoutRef<typeof Sidebar>['codeownersData'];
}) => {
  render(
    <Sidebar
      {...props}
      onShowAll={() => {}}
      onHideAll={() => {}}
      onTagHide={() => {}}
      onTagShow={() => {}}
      onTagFocus={() => {}}
      onTeamHide={() => {}}
      onTeamShow={() => {}}
      onTeamFocus={() => {}}
      onPackageHide={() => {}}
      onPackageShow={() => {}}
      onPackageFocus={() => {}}
    />
  );
};

const pkgOne = {
  path: `/path/to/package-one`,
  name: `@scope/one`,
  version: '1.0.0',
  dependencies: [
    {
      name: '@scope/two',
      version: '1.0.0',
      type: 'PRODUCTION' as any,
    },
    {
      name: '@scope/three',
      version: '1.0.0',
      type: 'DEVELOPMENT' as any,
    },
  ],
  devDependencies: [],
  peerDependencies: [],
} satisfies Package;

const pkgTwo = {
  path: `/path/to/package-two`,
  name: `@scope/two`,
  version: '1.0.0',
  dependencies: [],
  devDependencies: [],
  peerDependencies: [],
} satisfies Package;

const pkgThree = {
  path: `/path/to/package-three`,
  name: `@scope/three`,
  version: '1.0.0',
  dependencies: [
    {
      name: '@scope/four',
      version: '1.0.0',
      type: 'PRODUCTION' as any,
    },
  ],
  devDependencies: [],
  peerDependencies: [],
} satisfies Package;

const pkgFour = {
  path: `/path/to/package-four`,
  name: `@scope/four`,
  version: '1.0.0',
  dependencies: [],
  devDependencies: [],
  peerDependencies: [],
} satisfies Package;

const pkgFive = {
  path: `/path/to/package-five-looooooooooooooonnnnnngggggggg`,
  name: `@scope/five-looooooooooooooonnnnnngggggggg`,
  version: '1.0.0',
  tags: ['tag-five'],
  owners: ['@team-five'],
  dependencies: [
    {
      name: '@scope/four',
      version: '1.0.0',
      type: 'PEER' as any,
    },
  ],
  devDependencies: [],
  peerDependencies: [],
};

describe('<Sidebar/>', () => {
  describe('when there is no search', () => {
    const initialSearch = undefined;

    describe('when there are no packages', () => {
      it('displays the empty state', () => {
        renderSidebar({
          initialSearch,
          visiblePackages: [],
          packages: [],
          tagsData: [],
          codeownersData: [],
        });

        expect(screen.getByText('Create your first package'));
      });
    });

    describe('when there are no tags', () => {
      it('displays the empty state', () => {
        renderSidebar({
          initialSearch,
          visiblePackages: [pkgOne, pkgTwo, pkgThree],
          packages: [pkgOne, pkgTwo, pkgThree, pkgFour, pkgFive],
          tagsData: [],
          codeownersData: [
            {
              packageName: '@scope/one',
              codeowners: ['@team-one'],
            },
            {
              packageName: '@scope/two',
              codeowners: ['@team-two'],
            },
            {
              packageName: '@scope/three',
              codeowners: ['@team-three'],
            },
            {
              packageName: '@scope/four',
              codeowners: ['@team-four'],
            },
            {
              packageName: '@scope/five',
              codeowners: ['@team-five'],
            },
          ],
        });

        expect(screen.getByText('Create your first tag'));
      });
    });

    describe('when there are no codeowners', () => {
      it('displays the empty state', () => {
        renderSidebar({
          initialSearch,
          visiblePackages: [pkgOne, pkgTwo, pkgThree],
          packages: [pkgOne, pkgTwo, pkgThree, pkgFour, pkgFive],
          tagsData: [
            { packageName: '@scope/one', tags: ['tag-one', 'tag-two'] },
            { packageName: '@scope/two', tags: ['tag-three'] },
            { packageName: '@scope/three', tags: ['tag-four'] },
            { packageName: '@scope/four', tags: ['tag-five'] },
            { packageName: '@scope/five', tags: ['tag-six'] },
          ],
          codeownersData: [
            {
              packageName: '@owner/one',
              codeowners: [],
            },
            {
              packageName: '@owner/two',
              codeowners: [],
            },
            {
              packageName: '@owner/three',
              codeowners: [],
            },
            {
              packageName: '@owner/four',
              codeowners: [],
            },
            {
              packageName: '@owner/five',
              codeowners: [],
            },
          ],
        });

        expect(screen.getByText('Create a CODEOWNERS file'));
      });
    });
  });

  describe('when there is a search', () => {
    describe('when there are no packages', () => {
      it('displays the zero state', async () => {
        renderSidebar({
          initialSearch: 'zzzzzzzz',
          visiblePackages: [],
          packages: [],
          tagsData: [],
          codeownersData: [],
        });

        expect(screen.getAllByText('No matches found')).toHaveLength(1);
      });
    });

    describe('when there are no tags', () => {
      it('displays the zero state', () => {
        renderSidebar({
          initialSearch: '@scope',
          visiblePackages: [pkgOne, pkgTwo, pkgThree],
          packages: [pkgOne, pkgTwo, pkgThree, pkgFour, pkgFive],
          tagsData: [],
          codeownersData: [
            {
              packageName: '@scope/one',
              codeowners: ['@team-one'],
            },
            {
              packageName: '@scope/two',
              codeowners: ['@team-two'],
            },
            {
              packageName: '@scope/three',
              codeowners: ['@team-three'],
            },
            {
              packageName: '@scope/four',
              codeowners: ['@team-four'],
            },
            {
              packageName: '@scope/five',
              codeowners: ['@team-five'],
            },
          ],
        });

        expect(screen.getByText('No matching tags')).toBeTruthy();
      });
    });

    describe('when there are no codeowners', () => {
      it('displays the zero state', () => {
        renderSidebar({
          initialSearch: 'tag',
          visiblePackages: [pkgOne, pkgTwo, pkgThree],
          packages: [pkgOne, pkgTwo, pkgThree, pkgFour, pkgFive],
          tagsData: [
            { packageName: '@scope/one', tags: ['tag-one', 'tag-two'] },
            { packageName: '@scope/two', tags: ['tag-three'] },
            { packageName: '@scope/three', tags: ['tag-four'] },
            { packageName: '@scope/four', tags: ['tag-five'] },
            { packageName: '@scope/five', tags: ['tag-six'] },
          ],
          codeownersData: [
            {
              packageName: '@owner/one',
              codeowners: [],
            },
            {
              packageName: '@owner/two',
              codeowners: [],
            },
            {
              packageName: '@owner/three',
              codeowners: [],
            },
            {
              packageName: '@owner/four',
              codeowners: [],
            },
            {
              packageName: '@owner/five',
              codeowners: [],
            },
          ],
        });

        expect(screen.getByText('No matching codeowners')).toBeTruthy();
      });
    });
  });
});
