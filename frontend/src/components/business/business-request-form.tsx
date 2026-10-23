"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Paperclip, X } from "lucide-react";
import { post } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { Field, fieldCls } from "@/components/account/auth-form";
import { NativeSelect } from "@/components/ui/native-select";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = ".pdf,.csv,.xls,.xlsx,.doc,.docx,.txt,.png,.jpg,.jpeg";

const COUNTRIES = [
  { code: "US", dial: "+1", name: "United States" },
  { code: "CA", dial: "+1", name: "Canada" },
  { code: "MX", dial: "+52", name: "Mexico" },
  { code: "GB", dial: "+44", name: "United Kingdom" },
  { code: "AU", dial: "+61", name: "Australia" },
  { code: "IN", dial: "+91", name: "India" },
  { code: "PK", dial: "+92", name: "Pakistan" },
  { code: "DE", dial: "+49", name: "Germany" },
  { code: "FR", dial: "+33", name: "France" },
];

export function BusinessRequestForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [country, setCountry] = useState("US");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const submit = useMutation({ mutationFn: (fd: FormData) => post("/business/requests", fd) });

  const pickFile = (f: File | undefined) => {
    setFileError(null);
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      return setFileError("That file is over 4 MB. Please attach a smaller file, or email it to us after you submit.");
    }
    setFile(f);
  };

  if (submit.isSuccess) {
    return (
      <div className="surface-card flex flex-col items-center p-10 text-center" role="status">
        <CheckCircle2 className="size-14 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-primary">Thank you — request received</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          One of our advisors will be in touch with you shortly to set up your business account and your filter list.
        </p>
      </div>
    );
  }

  return (
    <form
      className="surface-card space-y-5 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "+1";
        const number = String(form.get("phoneNumber") ?? "").trim();
        form.delete("phoneNumber");
        form.set("phone", `${dial} ${number}`);
        if (file) form.set("file", file);
        else form.delete("file");
        submit.mutate(form);
      }}
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-primary">Request a Free Business Account Today</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Delivering fresh air to your business is a big goal of ours. Fill out the form and one of our advisors will be
          in touch with you quickly.
        </p>
      </div>

      <Field label="Name *">
        <input required name="name" autoComplete="name" maxLength={120} className={fieldCls} />
      </Field>
      <Field label="Email *">
        <input required type="email" name="email" autoComplete="email" maxLength={160} className={fieldCls} />
      </Field>

      <div className="block space-y-1.5">
        <label htmlFor="biz-phone" className="text-sm font-semibold text-foreground">Phone *</label>
        <div className="flex gap-2">
          <NativeSelect
            aria-label="Country code"
            size="lg"
            className="h-11 w-full"
            wrapperClassName="w-28 shrink-0"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.dial}
              </option>
            ))}
          </NativeSelect>
          <input
            id="biz-phone"
            required
            type="tel"
            name="phoneNumber"
            autoComplete="tel-national"
            minLength={5}
            maxLength={25}
            className={fieldCls}
          />
        </div>
      </div>

      <Field label="Company *">
        <input required name="company" autoComplete="organization" maxLength={160} className={fieldCls} />
      </Field>
      <Field label="Address *">
        <input required name="address" autoComplete="street-address" maxLength={300} className={fieldCls} />
      </Field>
      <Field label="Have you ever ordered KorganoTech filters through korganotech.com or Walmart.com? *">
        <textarea
          required
          name="orderedBefore"
          rows={4}
          maxLength={2000}
          className={cn(fieldCls, "h-auto resize-y py-2.5")}
          placeholder="Tell us a little about what you have ordered, or say no if this is your first time."
        />
      </Field>

      <div className="space-y-1.5">
        <label htmlFor="biz-file" className="text-sm font-semibold text-foreground">
          Upload your filter list (optional)
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-input bg-white p-2">
          <input
            ref={fileRef}
            id="biz-file"
            type="file"
            accept={ACCEPT}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-lavender"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {file ? (
            <button
              type="button"
              aria-label="Remove file"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary"
              onClick={() => {
                pickFile(undefined);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        {fileError ? (
          <p role="alert" className="text-xs font-medium text-destructive">{fileError}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Paperclip className="size-3.5" /> You can add a file up to 4 MB (PDF, spreadsheet, document or photo).
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, irresistible to bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {submit.error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {submit.error.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submit.isPending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-60"
      >
        {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Request my business account
      </button>
    </form>
  );
}
