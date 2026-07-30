import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const serverPort = Number(process.env.PORT || 3100);
const clientPort = Number(process.env.VITE_PORT || 18473);
const processes = [];

function run(command, args) {
  return spawn(command, args, { cwd: root, stdio: 'inherit', windowsHide: true });
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      const request = http.get(`http://localhost:${serverPort}/api/health`, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) return resolve();
        retry();
      });
      request.on('error', retry);
      request.setTimeout(700, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - startedAt > 15000) return reject(new Error(`Server CMS tidak siap di port ${serverPort}.`));
      setTimeout(check, 250);
    };
    check();
  });
}

function isServerReady() {
  return new Promise((resolve) => {
    const request = http.get(`http://localhost:${serverPort}/api/health`, (response) => {
      response.resume();
      resolve(Boolean(response.statusCode && response.statusCode < 500));
    });
    request.on('error', () => resolve(false));
    request.setTimeout(500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function isClientReady() {
  return new Promise((resolve) => {
    const request = http.get(`http://localhost:${clientPort}/`, (response) => {
      response.resume();
      resolve(Boolean(response.statusCode && response.statusCode < 500));
    });
    request.on('error', () => resolve(false));
    request.setTimeout(500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function shutdown(signal = 'SIGTERM') {
  for (const child of processes) {
    if (child.killed) continue;
    if (process.platform === 'win32' && child.pid) {
      spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      child.kill(signal);
    }
  }
}

for (const child of processes) {
  watchChild(child);
}

function watchChild(child) {
  child.on('error', (error) => {
    console.error(error);
    process.exitCode = 1;
    shutdown();
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      shutdown();
    }
  });
}

async function main() {
  if (await isServerReady()) {
    console.log(`STAR CMS already running at http://localhost:${serverPort}`);
  } else {
    const server = run(process.execPath, ['--no-warnings', 'server/index.js']);
    processes.push(server);
    watchChild(server);
    await waitForServer();
  }
  if (await isClientReady()) {
    console.log(`Vite already running at http://localhost:${clientPort}`);
  } else {
    const client = run(process.execPath, [viteBin, '--config', 'client/vite.config.js']);
    processes.push(client);
    watchChild(client);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  shutdown();
});
