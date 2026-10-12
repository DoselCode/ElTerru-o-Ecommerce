import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { gateway } from 'ai';

export default {
  // The Vercel AI Gateway serves the model id and reads AI_GATEWAY_API_KEY, or the OIDC token of a linked Vercel project.
  agents: {
    default: {
      model: gateway('openai/gpt-6-luna-fast'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
  },
  targets: [{
    engine: web(),
    app: {
      url: process.env.APP_URL ?? 'http://localhost:5173',
      command: process.platform === 'win32'
        ? { executable: 'cmd.exe', args: ['/c', 'npm', 'run', 'dev'], reuseExisting: true }
        : { executable: 'npm', args: ['run', 'dev'], reuseExisting: true },
    },
  }],
} satisfies E2EConfig;
