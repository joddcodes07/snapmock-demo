const { spawn } = require('node:child_process');
const path = require('node:path');

// Resolve the fixture from this script's location, independent of the shell's cwd.
const projectRoot = path.resolve(__dirname, '..');
const databasePath = path.join(projectRoot, 'db.json');
const snapMockCli = path.join(projectRoot, 'node_modules', 'snapmock', 'bin', 'snapmock.js');
const extraArgs = process.argv.slice(2);

console.log(`Using demo database: ${databasePath}`);

const child = spawn(process.execPath, [snapMockCli, '--db', databasePath, '--port', '3000', ...extraArgs], {
  cwd: projectRoot,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child.kill(signal));
}

child.once('error', (error) => {
  console.error(`Could not start the installed SnapMock CLI: ${error.message}`);
  process.exitCode = 1;
});

child.once('exit', (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
