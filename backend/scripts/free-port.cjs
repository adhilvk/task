const { execSync } = require('child_process');
const path = require('path');

const port = String(process.argv[2] || process.env.PORT || 3000);
const backendDir = path.resolve(__dirname, '..').toLowerCase();

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (error) {
    return error.stdout || '';
  }
}

function listeningPids() {
  const output = run('netstat -ano');
  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes('LISTENING')) {
      continue;
    }

    const match = line.match(new RegExp(`[:\\[]${port}(?:\\]|\\s)`));
    if (!match) {
      continue;
    }

    const pid = Number(line.trim().split(/\s+/).pop());
    if (pid) {
      pids.add(pid);
    }
  }

  return pids;
}

function backendWatchPids() {
  const output = run(
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -match \'^node(\\.exe)?$\' } | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"',
  );

  if (!output.trim()) {
    return new Set();
  }

  let rows;
  try {
    rows = JSON.parse(output);
  } catch {
    return new Set();
  }

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  const pids = new Set();

  for (const row of rows) {
    const command = String(row.CommandLine || '').toLowerCase();
    const isThisBackend = command.includes(backendDir);
    const isWatch =
      command.includes('nest.js') && command.includes('start') && command.includes('watch');
    const isMain = command.includes(path.join(backendDir, 'dist', 'main'));

    if (isThisBackend && (isWatch || isMain) && row.ProcessId) {
      pids.add(Number(row.ProcessId));
    }
  }

  return pids;
}

const pids = new Set([...listeningPids(), ...backendWatchPids()]);
pids.delete(process.pid);
pids.delete(process.ppid);

for (const pid of pids) {
  try {
    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    console.log(`Stopped PID ${pid} so port ${port} is free`);
  } catch {
    // Process already exited.
  }
}
