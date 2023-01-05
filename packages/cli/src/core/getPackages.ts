import path from 'path';
import fs from 'fs-extra';
import type { LocalPackage } from '@commonalityco/types';
import { getPackageType } from './getPackageType';
import { getOwnersForPath } from '@commonalityco/codeowners';

export const getPackages = async ({
  packageDirectories,
  rootDirectory,
}: {
  packageDirectories: string[];
  rootDirectory: string;
}) => {
  const packagesWithTags: LocalPackage[] = [];

  for (const directory of packageDirectories) {
    const packageJsonPath = path.join(rootDirectory, directory, 'package.json');
    const packageConfigPath = path.join(
      rootDirectory,
      directory,
      'commonality.json'
    );

    const packageJson: {
      name: string;
      version: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    } = await fs.readJSON(packageJsonPath);

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const peerDependencies = packageJson.peerDependencies || {};

    const formattedDependencies = Object.entries(dependencies).map(
      ([name, version]) => {
        return { name, version };
      }
    );
    const formattedDevDependencies = Object.entries(devDependencies).map(
      ([name, version]) => {
        return { name, version };
      }
    );
    const formattedPeerDependencies = Object.entries(peerDependencies).map(
      ([name, version]) => {
        return { name, version };
      }
    );

    const allDeps = [
      ...formattedDependencies,
      ...formattedDevDependencies,
      ...formattedPeerDependencies,
    ];
    const type = getPackageType(allDeps);

    const owners = getOwnersForPath({ path: directory, rootDirectory });

    if (!fs.pathExistsSync(packageConfigPath)) {
      packagesWithTags.push({
        name: packageJson.name,
        path: directory,
        version: packageJson.version,
        tags: [],
        type,
        devDependencies: formattedDevDependencies,
        dependencies: formattedDependencies,
        peerDependencies: formattedPeerDependencies,
        owners,
      });
      continue;
    }

    const pkgConfig = await fs.readJSON(packageConfigPath);

    packagesWithTags.push({
      name: packageJson.name,
      path: directory,
      version: packageJson.version,
      tags: pkgConfig.tags,
      type: getPackageType([
        ...formattedDependencies,
        ...formattedDevDependencies,
        ...formattedPeerDependencies,
      ]),
      devDependencies: formattedDevDependencies,
      dependencies: formattedDependencies,
      peerDependencies: formattedPeerDependencies,
      owners,
    });
  }

  return packagesWithTags;
};
