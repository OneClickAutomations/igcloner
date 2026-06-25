import { useState } from "react";
import {
  ExternalLink,
  BookOpen,
  Video,
  HelpCircle,
  MessageCircle,
  Lightbulb,
  MapIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpDrawer } from "./HelpDrawer";
import { UPLOAD_POST_HELP, ELEVENLABS_HELP, ANTHROPIC_HELP } from "./helpContent";

const SETUP_GUIDES = [
  {
    icon: "📤",
    label: "Upload-Post Setup Guide",
    description: "Connect and publish to 9+ social platforms",
    content: UPLOAD_POST_HELP,
  },
  {
    icon: "🎙",
    label: "ElevenLabs Setup Guide",
    description: "AI voiceover generation for Reels",
    content: ELEVENLABS_HELP,
  },
  {
    icon: "🤖",
    label: "Anthropic (Claude) Setup Guide",
    description: "Power your content AI features",
    content: ANTHROPIC_HELP,
  },
];

const FAQS = [
  {
    question: "How do I get started with IGCloner?",
    answer:
      "Analyze your first Instagram post by pasting a URL into the Analyze tab. IGCloner will extract the content strategy, performance score, and viral factors so you can replicate what works.",
  },
  {
    question: "What social platforms can I publish to?",
    answer:
      "Via the Upload-Post integration: Instagram, TikTok, YouTube, Facebook, LinkedIn, X (Twitter), Threads, Pinterest, Bluesky, Reddit, Discord, and Telegram.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. API keys are encrypted with AES-256-GCM before storage and never returned to the browser. Social media credentials are handled by Upload-Post — IGCloner never sees your passwords.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Go to Settings → Subscription and click Manage Subscription. Your plan downgrades to Free at the end of the billing period.",
  },
  {
    question: "Can I use my own AI API keys?",
    answer:
      "Yes. Add your own Anthropic, OpenAI, or ElevenLabs key in Settings → API Keys. This lets you use your own quota and models.",
  },
];

export function HelpSection() {
  const [search, setSearch] = useState("");
  const [openGuide, setOpenGuide] = useState<any>(null);

  const filteredFaqs = FAQS.filter(
    (faq) =>
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Help & Resources</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Documentation, guides, and support for IGCloner.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="https://docs.igcloner.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors"
          >
            <BookOpen className="h-5 w-5 text-accent-primary" />
            <div>
              <p className="text-sm font-semibold">Documentation</p>
              <p className="text-xs text-muted-foreground">Full guides and references</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </a>
          <button className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors text-left">
            <Video className="h-5 w-5 text-accent-primary" />
            <div>
              <p className="text-sm font-semibold">Video Walkthrough</p>
              <p className="text-xs text-muted-foreground">4-minute quick start</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </button>
        </div>

        {/* Setup guides */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
            Setup Guides
          </p>
          <div className="space-y-2">
            {SETUP_GUIDES.map((guide) => (
              <button
                key={guide.label}
                onClick={() => setOpenGuide(guide.content)}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 hover:bg-accent transition-colors text-left"
              >
                <span className="text-lg">{guide.icon}</span>
                <div>
                  <p className="text-sm font-medium">{guide.label}</p>
                  <p className="text-xs text-muted-foreground">{guide.description}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* FAQ search */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ig">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Frequently Asked Questions
          </p>
          <Input
            placeholder="Search help articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible>
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={String(i)}>
                  <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No results for "{search}"
            </p>
          )}
        </div>

        {/* Contact */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => window.open("mailto:support@igcloner.com")}
          >
            <MessageCircle className="h-4 w-4" /> Contact Support
          </Button>
          <Button variant="outline" className="gap-1.5">
            <Lightbulb className="h-4 w-4" /> Request a Feature
          </Button>
          <Button variant="outline" className="gap-1.5">
            <MapIcon className="h-4 w-4" /> Roadmap
          </Button>
        </div>
      </div>

      <HelpDrawer content={openGuide} open={!!openGuide} onClose={() => setOpenGuide(null)} />
    </>
  );
}
