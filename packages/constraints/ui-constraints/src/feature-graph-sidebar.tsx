'use client';
import { GraphContext } from './graph-provider';
import { CodeownersData, Package, TagsData } from '@commonalityco/types';
import { Sidebar } from './sidebar';
import { ComponentProps } from 'react';

interface FeatureGraphSidebarProperties {
  codeownersData: CodeownersData[];
  tagsData: TagsData[];
  packages: Package[];
  onLayout?: ComponentProps<typeof Sidebar>['onLayout'];
  defaultLayout?: ComponentProps<typeof Sidebar>['defaultLayout'];
}

export function FeatureGraphSidebar({
  codeownersData,
  tagsData,
  packages,
  onLayout,
  defaultLayout,
}: FeatureGraphSidebarProperties) {
  const { send } = GraphContext.useActorRef();
  const visiblePackages = GraphContext.useSelector((state) => {
    if (!state.context.renderGraph) return [];

    return state.context.renderGraph
      .nodes()
      .map((node) => node.data()) as Package[];
  });

  return (
    <Sidebar
      onLayout={onLayout}
      defaultLayout={defaultLayout}
      onHideAll={() => send({ type: 'HIDE_ALL' })}
      onShowAll={() => send({ type: 'SHOW_ALL' })}
      onPackageHide={(package_) =>
        send({
          type: 'HIDE',
          selector: `node[name="${package_}"]`,
        })
      }
      onPackageShow={(package_) =>
        send({ type: 'SHOW', selector: `node[name="${package_}"]` })
      }
      onPackageFocus={(package_) =>
        send({ type: 'FOCUS', selector: `node[name="${package_}"]` })
      }
      onTagHide={(tag) =>
        send({
          type: 'HIDE',
          selector: (element) => {
            const package_: Package = element.data();
            const tagDataForPackage = tagsData?.find(
              (data) => data.packageName === package_.name,
            );

            return tagDataForPackage?.tags.includes(tag) ?? false;
          },
        })
      }
      onTagShow={(tag) =>
        send({
          type: 'SHOW',
          selector: (element) => {
            const package_: Package = element.data();
            const tagDataForPackage = tagsData?.find(
              (data) => data.packageName === package_.name,
            );

            return tagDataForPackage?.tags.includes(tag) ?? false;
          },
        })
      }
      onTagFocus={(tag) =>
        send({
          type: 'FOCUS',
          selector: (element) => {
            if (element.isEdge()) {
              return false;
            }

            const package_: Package = element.data();
            const tagDataForPackage = tagsData?.find(
              (data) => data.packageName === package_.name,
            );

            return tagDataForPackage?.tags.includes(tag) ?? false;
          },
        })
      }
      onTeamHide={(team) => {
        send({
          type: 'HIDE',
          selector: (element) => {
            const package_: Package = element.data();
            const ownerDataForPackage = codeownersData?.find(
              (data) => data.packageName === package_.name,
            );

            return ownerDataForPackage?.codeowners.includes(team) ?? false;
          },
        });
      }}
      onTeamShow={(team) => {
        send({
          type: 'SHOW',
          selector: (element) => {
            const package_: Package = element.data();
            const ownerDataForPackage = codeownersData?.find(
              (data) => data.packageName === package_.name,
            );

            return ownerDataForPackage?.codeowners.includes(team) ?? false;
          },
        });
      }}
      onTeamFocus={(team) =>
        send({
          type: 'FOCUS',
          selector: (element) => {
            if (element.isEdge()) {
              return false;
            }

            const package_: Package = element.data();
            const ownerDataForPackage = codeownersData?.find(
              (data) => data.packageName === package_.name,
            );

            return ownerDataForPackage?.codeowners.includes(team) ?? false;
          },
        })
      }
      codeownersData={codeownersData}
      tagsData={tagsData ?? []}
      packages={packages}
      visiblePackages={visiblePackages ?? []}
    />
  );
}

export default FeatureGraphSidebar;
