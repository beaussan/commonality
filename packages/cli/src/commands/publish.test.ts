/* eslint-disable @typescript-eslint/naming-convention */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import fs from 'fs-extra';
import { execa } from 'execa';
import { MockServer } from 'jest-mock-server';
import { afterEach, jest } from '@jest/globals';
import { config } from '../core/config.js';
import { getCurrentBranch } from '../core/get-current-branch.js';

const oraSucceed = jest.fn();
const oraFail = jest.fn();

jest.mock('ora', () => ({
	default: jest.fn().mockReturnValue({
		start: jest.fn().mockReturnValue({ succeed: oraSucceed, fail: oraFail }),
	}),
}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binaryPath = path.resolve(__dirname, `../../scripts/start.js`);
const distPath = path.resolve(__dirname, '../../dist');
const temporaryDir = path.join(tmpdir(), 'commonality-cli-test');
const distToTemporary = path.relative(distPath, temporaryDir);

const defaultArgs = ['--cwd', distToTemporary];

describe('publish', () => {
	const server = new MockServer();
	const authServer = new MockServer();
	const bodySpy = jest.fn();

	let deviceCodeRoute: globalThis.jest.Mock;
	let tokenRoute: globalThis.jest.Mock;

	beforeAll(async () => {
		await server.start();
		await authServer.start();
	});

	afterEach(() => {
		server.reset();
		authServer.reset();
	});

	afterAll(async () => {
		await server.stop();
		await authServer.stop();
	});

	beforeEach(async () => {
		config.clear();
		jest.clearAllMocks();

		const currentBranch = await getCurrentBranch();

		deviceCodeRoute = authServer
			.post('/oauth/device/code')
			.mockImplementation((ctx) => {
				ctx.status = 200;
				ctx.body = {
					device_code: '123-456',
					user_code: 'ABC-DEF',
					verification_uri: 'verify',
					verification_uri_complete: 'verify-complete',
					expires_in: 100_000,
					interval: 0.5,
				};
			});

		tokenRoute = authServer
			.post('/oauth/token')
			.mockImplementationOnce((ctx) => {
				ctx.status = 200;
				ctx.body = {
					access_token: '123',
					expires_in: 123,
					token_type: 'access_token',
				};
			});

		server.post('/api/cli/publish').mockImplementation((ctx) => {
			ctx.status = 200;

			bodySpy(ctx.request.body);

			ctx.body = {
				url: `https://app.commonality.co/monorepo/root/${currentBranch}`,
			};
		});

		fs.outputJsonSync(path.join(temporaryDir, './package-lock.json'), {});
		fs.outputJsonSync(path.join(temporaryDir, './package.json'), {
			workspaces: ['apps/*', 'packages/*'],
		});
		fs.outputJsonSync(path.join(temporaryDir, './.commonality/config.json'), {
			project: '123',
		});
		fs.outputJsonSync(path.join(temporaryDir, './apps/app-foo/package.json'), {
			name: '@scope/app-foo',
			version: '1.0.0',
			dependencies: {
				bar: '^1.0.0',
			},
		});
		fs.outputJsonSync(
			path.join(temporaryDir, './apps/app-foo/commonality.json'),
			{
				tags: ['tag-one'],
			}
		);
		fs.outputJsonSync(
			path.join(temporaryDir, './packages/pkg-foo/package.json'),
			{
				name: '@scope/pkg-foo',
				version: '2.0.0',
				devDependencies: {
					bar: '^1.0.0',
				},
			}
		);
		fs.outputJsonSync(
			path.join(temporaryDir, './packages/pkg-foo/commonality.json'),
			{
				tags: ['tag-two'],
			}
		);
	});

	describe('when authenticating with a passed publish key', () => {
		it('should not call the auth API', async () => {
			await execa(
				binaryPath,
				['publish', '--publishKey', '123', ...defaultArgs],
				{
					env: {
						COMMONALITY_API_ORIGIN: server.getURL().origin,
						COMMONALITY_AUTH_ORIGIN: authServer.getURL().origin,
					},
				}
			);

			expect(deviceCodeRoute).not.toHaveBeenCalled();
			expect(tokenRoute).not.toHaveBeenCalled();
		});
	});

	describe('when authenticating with a env var publish key', () => {
		it('should not call the auth API', async () => {
			await execa(binaryPath, ['publish', ...defaultArgs], {
				env: {
					COMMONALITY_API_ORIGIN: server.getURL().origin,
					COMMONALITY_AUTH_ORIGIN: authServer.getURL().origin,
					COMMONALITY_PUBLISH_KEY: '123',
				},
			});

			expect(deviceCodeRoute).not.toHaveBeenCalled();
			expect(tokenRoute).not.toHaveBeenCalled();
		});
	});

	describe('when authenticating with an access token', () => {
		it('should call the auth API', async () => {
			await execa(binaryPath, ['publish', ...defaultArgs], {
				env: {
					COMMONALITY_API_ORIGIN: server.getURL().origin,
					COMMONALITY_AUTH_ORIGIN: authServer.getURL().origin,
				},
			});

			expect(deviceCodeRoute).toHaveBeenCalled();
			expect(tokenRoute).toHaveBeenCalled();
		});
	});

	it('should POST to the URL with the correct data', async () => {
		authServer.post('/oauth/device/code').mockImplementation((ctx) => {
			ctx.status = 200;
		});

		authServer.post('/oauth/token').mockImplementationOnce((ctx) => {
			ctx.status = 200;
		});

		await execa(binaryPath, ['publish', ...defaultArgs], {
			env: {
				COMMONALITY_API_ORIGIN: server.getURL().origin,
				COMMONALITY_AUTH_ORIGIN: authServer.getURL().origin,
				COMMONALITY_PUBLISH_KEY: '123',
			},
		});

		const currentBranch = await getCurrentBranch();

		expect(bodySpy).toHaveBeenCalledWith(
			expect.objectContaining({
				branch: currentBranch,
				packages: [
					{
						dependencies: [
							{
								name: 'bar',
								version: '^1.0.0',
							},
						],
						devDependencies: [],
						name: '@scope/app-foo',
						owners: [],
						path: 'apps/app-foo',
						peerDependencies: [],
						tags: ['tag-one'],
						type: 'NODE',
						version: '1.0.0',
					},
					{
						dependencies: [],
						devDependencies: [
							{
								name: 'bar',
								version: '^1.0.0',
							},
						],
						name: '@scope/pkg-foo',
						owners: [],
						path: 'packages/pkg-foo',
						peerDependencies: [],
						tags: ['tag-two'],
						type: 'NODE',
						version: '2.0.0',
					},
				],
				projectId: '123',
				tags: ['tag-one', 'tag-two'],
			})
		);
	});

	it('should output the published view url', async () => {
		const currentBranch = await getCurrentBranch();

		const { stdout } = await execa(binaryPath, ['publish', ...defaultArgs], {
			env: {
				COMMONALITY_API_ORIGIN: server.getURL().origin,
				COMMONALITY_AUTH_ORIGIN: authServer.getURL().origin,
				COMMONALITY_PUBLISH_KEY: '123',
			},
		});

		expect(stdout).toEqual(
			expect.stringContaining(
				`https://app.commonality.co/monorepo/root/${currentBranch}`
			)
		);
	});
});
