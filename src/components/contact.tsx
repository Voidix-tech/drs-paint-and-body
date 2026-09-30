"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrowUpRight, IconPhone, IconMapPin, IconCheck } from "@tabler/icons-react";
import { BUSINESS, type Service } from "@/lib/types";

export function InquiryForm({ services, selectedService, vehicle, initialMessage, heading = "Request a callback" }: { services: Service[]; selectedService?: string; vehicle?: string; initialMessage?: string; heading?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const status = useRef<HTMLDivElement>(null);
  const errorMessage = useRef<HTMLParagraphElement>(null);

  useEffect(() => { if (sent) status.current?.focus(); }, [sent]);
  useEffect(() => { if (error) errorMessage.current?.focus(); }, [error]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send. Please try again.");
      setSent(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Unable to send. Please call the shop.");
    } finally { setBusy(false); }
  }

  return <div className="contact-form-wrap">
        {sent ? <div ref={status} className="success-panel" role="status" tabIndex={-1}>
          <IconCheck size={42} /><h3>Message received.</h3>
          <p>Your inquiry is saved. If you need to speak with someone now, call {BUSINESS.phone}.</p>
          <button type="button" className="button secondary" onClick={() => setSent(false)}>Send another inquiry<IconArrowUpRight size={17} /></button>
        </div> : <form onSubmit={submit} className="contact-form" aria-busy={busy}>
          <h3>{heading}</h3>
          <p className="form-intro">A few details are all we need to get started. All fields are required except email.</p>
          <div className="form-row">
            <label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="First and last name" /></label>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} placeholder="Your phone number" /></label>
          </div>
          <label>Email <span className="optional">(optional)</span><input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" /></label>
          <label>How can we help?<select key={selectedService || "none"} name="serviceId" defaultValue={selectedService || ""} required><option value="" disabled>Select a service</option>{services.map(service => <option key={service.id} value={service.id}>{service.title}</option>)}</select></label>
          <label>Tell us about your vehicle<textarea key={initialMessage || vehicle || "no-vehicle"} name="message" rows={4} required maxLength={2000} defaultValue={initialMessage ?? (vehicle ? `I'm interested in ${vehicle}. Please contact me with more information.` : "")} placeholder="Year, make, model, and what you need help with…" /></label>
          {error && <p ref={errorMessage} className="form-error" role="alert" tabIndex={-1}>{error}</p>}
          {services.length === 0 && <p className="form-error">Online inquiries are unavailable. Please call <a href={`tel:${BUSINESS.tel}`}>{BUSINESS.phone}</a> to discuss your vehicle.</p>}
          <button type="submit" className="button primary" disabled={busy || services.length === 0}>{busy ? "Saving your inquiry…" : "Request a callback"}<IconArrowUpRight size={18} /></button>
          <p className="form-helper">Your contact details are used to respond to your inquiry. Demo submissions are saved only; no email is sent.</p>
        </form>}
  </div>;
}

export function Contact({ services, selectedService, vehicle }: { services: Service[]; selectedService?: string; vehicle?: string }) {
  return <section id="contact" className="contact-section section"><div className="container contact-grid">
    <div className="contact-copy">
      <h2>Let’s get you{" "}<br /><span>back on the road.</span></h2>
      <p>Tell us about your vehicle and what you need. We’ll have your details ready for a conversation.</p>
      <a className="contact-phone" href={`tel:${BUSINESS.tel}`}><IconPhone size={26} />{BUSINESS.phone}<IconArrowUpRight size={22} /></a>
      <a className="address-link" href={BUSINESS.directions} target="_blank" rel="noreferrer"><IconMapPin size={21} /><span>220 Jackson St<br />Suffolk, VA 23434</span><IconArrowUpRight size={18} /></a>
      <p className="contact-note">Prefer to talk it through? Give us a call.</p>
    </div>
    <InquiryForm services={services} selectedService={selectedService} vehicle={vehicle} />
  </div></section>;
}
