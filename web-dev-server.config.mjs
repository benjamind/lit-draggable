import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
    rootDir: './demo',
    port: 3000,
    watch: true,
    http2: true,
    nodeResolve: true,
    appIndex: 'index.html',
    format: 'esm',
    plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
};
