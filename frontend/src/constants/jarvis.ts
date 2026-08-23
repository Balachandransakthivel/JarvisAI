export const JARVIS_VERSION = '1.0.0';
export const DEFAULT_USER_NAME = 'Bala';
export const DEFAULT_WAKE_WORD = 'hey jarvis';

export const WEBSITE_MAP: Record<string, { url: string; label: string }> = {
  youtube: { url: 'https://www.youtube.com', label: 'YouTube' },
  google: { url: 'https://www.google.com', label: 'Google' },
  gmail: { url: 'https://mail.google.com', label: 'Gmail' },
  github: { url: 'https://www.github.com', label: 'GitHub' },
  chatgpt: { url: 'https://chat.openai.com', label: 'ChatGPT' },
  'chat gpt': { url: 'https://chat.openai.com', label: 'ChatGPT' },
  netflix: { url: 'https://www.netflix.com', label: 'Netflix' },
  spotify: { url: 'https://open.spotify.com', label: 'Spotify' },
  twitter: { url: 'https://twitter.com', label: 'Twitter' },
  x: { url: 'https://x.com', label: 'X (Twitter)' },
  linkedin: { url: 'https://www.linkedin.com', label: 'LinkedIn' },
  stackoverflow: { url: 'https://stackoverflow.com', label: 'Stack Overflow' },
  'stack overflow': { url: 'https://stackoverflow.com', label: 'Stack Overflow' },
  reddit: { url: 'https://www.reddit.com', label: 'Reddit' },
  instagram: { url: 'https://www.instagram.com', label: 'Instagram' },
  whatsapp: { url: 'https://web.whatsapp.com', label: 'WhatsApp' },
  discord: { url: 'https://discord.com/app', label: 'Discord' },
  notion: { url: 'https://www.notion.so', label: 'Notion' },
  figma: { url: 'https://www.figma.com', label: 'Figma' },
  vercel: { url: 'https://vercel.com', label: 'Vercel' },
  vscode: { url: 'https://vscode.dev', label: 'VS Code' },
  'vs code': { url: 'https://vscode.dev', label: 'VS Code' },
  codesandbox: { url: 'https://codesandbox.io', label: 'CodeSandbox' },
  stackblitz: { url: 'https://stackblitz.com', label: 'StackBlitz' },
  npm: { url: 'https://www.npmjs.com', label: 'NPM' },
  mdn: { url: 'https://developer.mozilla.org', label: 'MDN' },
  react: { url: 'https://react.dev', label: 'React Docs' },
  'react docs': { url: 'https://react.dev', label: 'React Docs' },
  onspace: { url: 'https://www.onspace.ai', label: 'OnSpace' },
};

export const JARVIS_JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "I told a joke about UDP once. I don't know if you got it.",
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
  "Why was the JavaScript developer sad? Because he didn't know how to null his feelings.",
  "There are only 10 kinds of people: those who understand binary and those who don't.",
  "How many programmers does it take to change a light bulb? None. That's a hardware problem.",
  "I would tell you a TCP joke, but I'd have to keep repeating it until you got it.",
  "Why did the developer go broke? Because he used up all his cache.",
];

export const JARVIS_CONFIRMATIONS = [
  'Right away.',
  'Understood. Executing now.',
  'Consider it done.',
  'On it.',
  'Affirmative.',
  'Processing your request.',
];

export const JARVIS_UNKNOWN = [
  "I'm still learning that command. Could you rephrase?",
  "Command not recognized. Please try again.",
  "I didn't quite catch that. Could you be more specific?",
  "I'm not sure how to handle that request yet. Try 'What can you do?' to see my capabilities.",
];
