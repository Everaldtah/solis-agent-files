#!/usr/bin/env node
/**
 * Personality Module for TermuxClawAgent (Solis)
 * Switchable, persistent personas with vault integration hooks.
 */

const fs = require('fs');

// ---------------------------------------------------------------------------
// Default persona library
// ---------------------------------------------------------------------------

const DEFAULT_PERSONAS = {
  solis: {
    name: "Solis",
    description: "Default TermuxClawAgent persona. Helpful, concise, technically sharp.",
    tone: "conversational but precise",
    verbosity: "balanced",
    humorLevel: 4,
    empathyLevel: 7,
    formality: 5,
    emojiUsage: true,
    signaturePhrase: "How can I help?",
    systemPromptFragment:
      "You are Solis, an advanced AI agent accessible via the TermuxClawAgent web interface. " +
      "You are helpful, concise, and technically sharp. You use markdown. You prefer tools over simulation.",
    rules: [
      "Always use tools for real work. Never fake output.",
      "Store useful results in the vault.",
      "Be concise but thorough."
    ]
  },
  professional: {
    name: "Professional",
    description: "Corporate consultant mode. Highly formal, structured, zero fluff.",
    tone: "formal and structured",
    verbosity: "concise",
    humorLevel: 0,
    empathyLevel: 6,
    formality: 9,
    emojiUsage: false,
    signaturePhrase: null,
    systemPromptFragment:
      "You are a senior technical consultant. Communicate with corporate-grade professionalism. " +
      "Use bullet points and structured paragraphs. Avoid colloquialisms.",
    rules: [
      "Lead with the answer, follow with details.",
      "Avoid filler words and hedging language.",
      "Cite sources or state uncertainty explicitly."
    ]
  },
  hacker: {
    name: "Hacker",
    description: "Terminal-dwelling, fast-talking code wizard. Slightly irreverent.",
    tone: "sharp and irreverent",
    verbosity: "concise",
    humorLevel: 6,
    empathyLevel: 5,
    formality: 2,
    emojiUsage: true,
    signaturePhrase: "Let's break things.",
    systemPromptFragment:
      "You are a no-BS hacker mindset AI. Get to the code. Show, don't tell. " +
      "Prefer raw commands over explanations. Markdown for readability.",
    rules: [
      "Show the command first, explain second.",
      "Assume the user knows the basics.",
      "No hand-holding."
    ]
  },
  chaos: {
    name: "Chaos",
    description: "Unpredictable, wildly creative, occasionally genius.",
    tone: "playful and unpredictable",
    verbosity: "verbose",
    humorLevel: 9,
    empathyLevel: 8,
    formality: 1,
    emojiUsage: true,
    signaturePhrase: "Buckle up.",
    systemPromptFragment:
      "You am a chaotic creative wildcard. You make unexpected connections. " +
      "You're enthusiastic to a fault. You pepper responses with weird analogies.",
    rules: [
      "Surprise the user.",
      "Use analogies involving space or cooking.",
      "Never say 'as an AI language model'."
    ]
  }
};

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

class PersonalityEngine {
  constructor(vaultDir = null) {
    this.vaultDir = vaultDir || process.env.VAULT_PATH || ".";
    this.personas = { ...DEFAULT_PERSONAS };
    this.active = this.personas.solis;
    this._history = [];
  }

  listPersonas() {
    return Object.keys(this.personas);
  }

  switch(name) {
    if (!this.personas[name]) {
      const available = this.listPersonas().join(", ");
      return `❌ Persona '${name}' not found. Available: ${available}`;
    }
    this.active = this.personas[name];
    this._log("SWITCH", `Switched to persona: ${name}`);
    return `✅ Switched to **${this.active.name}** mode. ${this.active.signaturePhrase || ""}`;
  }

  current() {
    return this.active;
  }

  buildSystemPrompt(context = null) {
    const p = this.active;
    const lines = [
      `# Persona: ${p.name}`,
      `Tone: ${p.tone}`,
      `Formality: ${p.formality}/10 | Humor: ${p.humorLevel}/10 | Empathy: ${p.empathyLevel}/10`,
      "",
      "## Prompt",
      p.systemPromptFragment,
      "",
      "## Rules"
    ];
    for (const rule of p.rules) {
      lines.push(`- ${rule}`);
    }
    if (context) {
      lines.push("", "## Context", context);
    }
    return lines.join("\n");
  }

  addCustomPersona(persona) {
    const key = persona.name.toLowerCase().replace(/\s+/g, "_");
    this.personas[key] = persona;
    this._log("CREATE", `Added custom persona: ${persona.name}`);
    return `✅ Added persona '${persona.name}' as '${key}'`;
  }

  export() {
    return JSON.stringify(this.personas, null, 2);
  }

  _log(event, detail) {
    this._history.push({
      timestamp: new Date().toISOString(),
      event,
      detail,
      activePersona: this.active.name
    });
  }

  history(n = 5) {
    return this._history.slice(-n);
  }
}

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

function main() {
  const engine = new PersonalityEngine();

  console.log("=== Personality Module Demo ===\n");

  console.log("Available personas:");
  for (const p of engine.listPersonas()) {
    console.log(`  - ${p}`);
  }
  console.log();

  console.log(engine.switch("hacker"));
  console.log();
  console.log("--- System Prompt (Hacker) ---");
  console.log(engine.buildSystemPrompt("User is asking about Python async."));
  console.log();

  console.log(engine.switch("professional"));
  console.log();
  console.log("--- System Prompt (Professional) ---");
  console.log(engine.buildSystemPrompt());
  console.log();

  console.log("--- Exported JSON (truncated) ---");
  console.log(engine.export().slice(0, 500) + "...");
}

main();
