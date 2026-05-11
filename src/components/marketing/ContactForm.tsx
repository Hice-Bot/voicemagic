"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Voicemagic contact from ${name || "website visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name || "(not provided)"}`,
        `Email: ${email || "(not provided)"}`,
        "",
        message || "(no message)",
      ].join("\n"),
    );

    window.location.href = `mailto:jeff@jeffhampton.us?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/25 backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-white/65">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
            placeholder="Your name"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/65">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
            placeholder="you@example.com"
            required
          />
        </label>
      </div>
      <label className="mt-4 flex flex-col gap-2 text-sm text-white/65">
        Message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-40 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
          placeholder="Tell us what you are building, what you need help with, or what you want to ask."
          required
        />
      </label>
      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#12081f] transition hover:bg-white/90"
      >
        Email Jeff
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-white/45">
        This opens your email app with the message addressed to jeff@jeffhampton.us.
      </p>
    </form>
  );
}
