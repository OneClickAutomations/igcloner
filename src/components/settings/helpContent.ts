export interface HelpStep {
  stepNumber: number;
  title: string;
  description: string;
  actionButton?: { label: string; href: string; isAffiliateLink?: boolean };
}

export interface HelpDrawerContent {
  provider: string;
  title: string;
  estimatedSetupTime: string;
  steps: HelpStep[];
  faq: { question: string; answer: string }[];
  troubleshooting: { issue: string; solution: string }[];
  docsUrl: string;
}

export const UPLOAD_POST_HELP: HelpDrawerContent = {
  provider: "upload_post",
  title: "Connect Upload-Post",
  estimatedSetupTime: "5 minutes",
  steps: [
    {
      stepNumber: 1,
      title: "Create your Upload-Post account",
      description:
        "Upload-Post lets you publish to Instagram, TikTok, LinkedIn, and 6 more platforms from one place. Sign up for a free account to get started.",
      actionButton: {
        label: "Sign Up for Upload-Post →",
        href: "upload_post",
        isAffiliateLink: true,
      },
    },
    {
      stepNumber: 2,
      title: "Verify your email",
      description:
        "Check your inbox for a verification email from Upload-Post and confirm your account before proceeding.",
    },
    {
      stepNumber: 3,
      title: "Find your API key",
      description:
        'Once logged in, go to your Upload-Post dashboard and look for "API Keys" or "Developer Settings" in the account menu.',
    },
    {
      stepNumber: 4,
      title: "Copy your API key",
      description:
        "Click the copy icon next to your API key. Keep this private — treat it like a password. Do not share it with anyone.",
    },
    {
      stepNumber: 5,
      title: "Paste it into IGCloner",
      description:
        "Come back to this page, paste your API key into the Upload-Post field above, and click Save & Validate.",
    },
    {
      stepNumber: 6,
      title: "Confirm the connection",
      description:
        "IGCloner automatically checks that your key works. You'll see a green \"Connected\" badge once it's confirmed.",
    },
    {
      stepNumber: 7,
      title: "Connect your social accounts",
      description:
        'Go to Social Accounts in Settings and click "Connect More." You\'ll be sent to Upload-Post to securely link Instagram, TikTok, LinkedIn, and any other platforms you use.',
      actionButton: { label: "Go to Social Accounts →", href: "/settings?section=social-accounts" },
    },
    {
      stepNumber: 8,
      title: "Authorize each platform",
      description:
        "Upload-Post will walk you through logging into each social platform and granting permission. This happens on Upload-Post's secure site — IGCloner never sees your social media passwords.",
    },
    {
      stepNumber: 9,
      title: "Return to IGCloner",
      description:
        "After connecting your accounts, you'll be redirected back here automatically. Your accounts will sync within a few seconds.",
    },
    {
      stepNumber: 10,
      title: "Start publishing",
      description:
        "You're all set! Head to any project and click Publish to post directly to your connected platforms.",
      actionButton: { label: "Go to Publishing Center →", href: "/publishing" },
    },
  ],
  faq: [
    {
      question: "Is Upload-Post free?",
      answer:
        "Upload-Post offers a free tier with limited monthly uploads. Paid plans unlock higher limits and additional platforms.",
    },
    {
      question: "Does IGCloner see my social media passwords?",
      answer:
        "No. All authentication happens directly on Upload-Post's secure platform. IGCloner only stores connection status, never your credentials.",
    },
    {
      question: "Can I disconnect a platform later?",
      answer: "Yes, anytime from the Social Accounts page in Settings.",
    },
    {
      question: "What if I already have an Upload-Post account?",
      answer:
        "Just grab your existing API key from your Upload-Post dashboard and paste it in — no need to create a new account.",
    },
  ],
  troubleshooting: [
    {
      issue: 'My API key shows as "Invalid"',
      solution:
        "Double-check you copied the entire key with no extra spaces. API keys are case-sensitive.",
    },
    {
      issue: "I connected a platform but it's not showing in IGCloner",
      solution: 'Click "Refresh" on the Social Accounts page to sync the latest connection status.',
    },
    {
      issue: 'My connection shows "Requires Attention"',
      solution:
        'This usually means a platform token expired. Click "Reconnect" next to that platform.',
    },
  ],
  docsUrl: "https://docs.upload-post.com/",
};

export const ELEVENLABS_HELP: HelpDrawerContent = {
  provider: "elevenlabs",
  title: "Connect ElevenLabs",
  estimatedSetupTime: "3 minutes",
  steps: [
    {
      stepNumber: 1,
      title: "Create or log in to ElevenLabs",
      description:
        "ElevenLabs provides AI-powered voice generation for your Reels. A free account gives you a monthly character allowance.",
      actionButton: { label: "Open ElevenLabs →", href: "elevenlabs", isAffiliateLink: true },
    },
    {
      stepNumber: 2,
      title: "Go to your Profile",
      description:
        'Click your profile icon in the top-right corner and select "Profile + API key".',
    },
    {
      stepNumber: 3,
      title: "Copy your API key",
      description:
        'Find your API key in the Profile section and click "Copy". Keep this key private.',
    },
    {
      stepNumber: 4,
      title: "Paste it into IGCloner",
      description:
        "Come back here, paste your key into the ElevenLabs field above, and click Save & Validate.",
    },
  ],
  faq: [
    {
      question: "What is ElevenLabs used for in IGCloner?",
      answer:
        "ElevenLabs generates realistic AI voiceovers for your Reels inside the Voiceover Studio.",
    },
    {
      question: "Do I need a paid ElevenLabs plan?",
      answer:
        "The free tier provides a monthly character limit. For high-volume voiceover generation, a paid plan is recommended.",
    },
  ],
  troubleshooting: [
    {
      issue: 'ElevenLabs shows "Invalid Key"',
      solution: "Make sure you copied the full API key from the Profile page, not a model ID.",
    },
  ],
  docsUrl: "https://docs.elevenlabs.io/",
};

export const ANTHROPIC_HELP: HelpDrawerContent = {
  provider: "anthropic",
  title: "Connect Anthropic (Claude)",
  estimatedSetupTime: "3 minutes",
  steps: [
    {
      stepNumber: 1,
      title: "Open the Anthropic Console",
      description:
        "Claude powers IGCloner's content analysis and angle generation. You need an Anthropic account with billing enabled.",
      actionButton: { label: "Open Anthropic Console →", href: "anthropic" },
    },
    {
      stepNumber: 2,
      title: "Go to API Keys",
      description:
        'In the Anthropic Console, click "API Keys" in the left sidebar and then "Create Key".',
    },
    {
      stepNumber: 3,
      title: "Copy your API key",
      description:
        "Copy the key immediately — it will only be shown once. Store it somewhere secure before pasting it here.",
    },
    {
      stepNumber: 4,
      title: "Paste it into IGCloner",
      description: "Paste the key into the Anthropic field above and click Save & Validate.",
    },
  ],
  faq: [
    {
      question: "Why does IGCloner need an Anthropic key?",
      answer:
        "Claude analyzes content, generates captions, extracts viral angles, and powers the AI features throughout the app.",
    },
  ],
  troubleshooting: [
    {
      issue: 'Anthropic shows "Invalid Key"',
      solution:
        "Verify your key in the Anthropic Console. Keys start with 'sk-ant-'. Make sure billing is set up.",
    },
  ],
  docsUrl: "https://docs.anthropic.com/",
};

export const HELP_CONTENT: Record<string, HelpDrawerContent> = {
  upload_post: UPLOAD_POST_HELP,
  elevenlabs: ELEVENLABS_HELP,
  anthropic: ANTHROPIC_HELP,
};
