// Interactive CLI Simulator for Synerbit
export function setupTerminal(onTriggerPulse) {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalSubmit = document.getElementById('terminal-submit');

  if (!terminalInput || !terminalOutput) return;

  const commands = {
    help: () => [
      'AVAILABLE COMMANDS:',
      '  status              - Displays mesh cluster telemetry and health',
      '  peers               - Lists connected geo-distributed validator nodes',
      '  benchmark           - Runs synthetic latency & quantum throughput benchmarks',
      '  pulse               - Triggers an electromagnetic resonance wave across the 3D core',
      '  explode             - Disassembles / reassembles the quantum core structure',
      '  crypt               - Inspects active quantum lattice encryption state',
      '  clear               - Clears terminal output buffer',
      '  help                - Prints this help manual'
    ],
    status: () => [
      'CORE ENGINE STATUS: ONLINE (OPTIMAL)',
      'Consensus: Neural Synapse v3.4 [Converged]',
      'Throughput: 1,421,800 ops/sec',
      'Active Shards: 12 / 12 Operational',
      'Cluster Entropy: 0.0014 (Near Ground-State)',
      'Security Tier: NIST Quantum Lattice Level 5'
    ],
    peers: () => [
      'DISCOVERED PEER NODES (5 of 842,000 shown):',
      '  [NODE-0x7F2A] US-East (N. Virginia)    - Latency: 0.18ms [ONLINE]',
      '  [NODE-0x89C1] EU-Central (Frankfurt)   - Latency: 0.22ms [ONLINE]',
      '  [NODE-0x3B44] AP-South (Singapore)     - Latency: 0.31ms [ONLINE]',
      '  [NODE-0xF012] AP-Northeast (Tokyo)     - Latency: 0.26ms [ONLINE]',
      '  [NODE-0x11E8] SA-East (São Paulo)      - Latency: 0.38ms [ONLINE]'
    ],
    benchmark: () => [
      '[BENCHMARK EXECUTION STARTING...]',
      'Step 1: Dispatching 100,000 synthetic micro-transactions...',
      'Step 2: Testing Lattice Trapdoor signature verifications...',
      'Step 3: Calculating electromagnetic propagation velocity...',
      'RESULT: 0.198ms Mean Consensus Finality | 1.48 PB/s Mesh Bandwidth | 0 Collisions',
      'PASSED: Synerbit cluster out-performed standard cloud benchmark by 420x.'
    ],
    pulse: () => {
      if (onTriggerPulse) onTriggerPulse();
      return [
        '>>> BROADCASTING QUANTUM ENERGY WAVE THROUGH COHERENCE LATTICE...',
        '>>> Core geometry synchronized. Flux ripple discharged.'
      ];
    },
    explode: () => {
      const explodeBtn = document.getElementById('btn-explode-toggle');
      if (explodeBtn) explodeBtn.click();
      return ['Toggled core deconstruction matrix.'];
    },
    crypt: () => [
      'ALGORITHM: Module-LWE (Learning With Errors over Rings)',
      'Key Size: 256-bit Post-Quantum Primitive',
      'Vulnerability to Shor\'s Quantum Algorithm: ZERO',
      'Zero-Knowledge Proof Verifier: Active [SNARK-Lattice Hybrid]'
    ],
    clear: () => {
      terminalOutput.innerHTML = '';
      return [];
    }
  };

  function executeCommand(rawCmd) {
    const trimmed = rawCmd.trim().toLowerCase();
    if (!trimmed) return;

    // Print command line
    const userLine = document.createElement('div');
    userLine.className = 'term-line cmd';
    userLine.innerHTML = `<span style="color:var(--cyan)">synerbit&gt;</span> ${escapeHtml(rawCmd)}`;
    terminalOutput.appendChild(userLine);

    if (commands[trimmed]) {
      const results = commands[trimmed]();
      results.forEach(res => {
        const line = document.createElement('div');
        line.className = 'term-line';
        if (res.startsWith('>>>') || res.startsWith('RESULT:') || res.startsWith('PASSED:')) {
          line.classList.add('success');
        } else if (res.startsWith('CORE ENGINE STATUS:')) {
          line.classList.add('welcome');
        }
        line.textContent = res;
        terminalOutput.appendChild(line);
      });
    } else {
      const errLine = document.createElement('div');
      errLine.className = 'term-line error';
      errLine.textContent = `Command not recognized: "${rawCmd}". Type "help" for a list of valid commands.`;
      terminalOutput.appendChild(errLine);
    }

    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    terminalInput.value = '';
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCommand(terminalInput.value);
    }
  });

  if (terminalSubmit) {
    terminalSubmit.addEventListener('click', () => {
      executeCommand(terminalInput.value);
    });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
