const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

function detectFrontendDir() {
  const frontendRoot = path.resolve(process.cwd(), 'frontend');

  if (!fs.existsSync(frontendRoot) || !fs.statSync(frontendRoot).isDirectory()) {
    throw new Error('frontend directory not found at ./frontend');
  }

  const rootPkg = path.join(frontendRoot, 'package.json');
  if (fs.existsSync(rootPkg)) {
    return frontendRoot;
  }

  const candidates = fs
    .readdirSync(frontendRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(frontendRoot, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, 'package.json')));

  if (candidates.length === 0) {
    throw new Error('No frontend package.json found inside ./frontend');
  }

  return candidates[0];
}

function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/frontend-run.cjs <npm args>');
    process.exit(1);
  }

  const cwd = detectFrontendDir();
  const npmCmd = 'npm';

  const child = spawn(npmCmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });
}

run();
