import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	outDir: 'dist',
	clean: true,
	format: ['esm'],
	onSuccess: 'tsc --declarationMap --project tsconfig.json',
});
