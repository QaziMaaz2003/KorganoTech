"use client";

import { Field, fieldCls } from "./auth-form";
import { NativeSelect } from "@/components/ui/native-select";

export interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export const emptyAddress: AddressInput = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
  "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
  "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function AddressFields({
  value,
  onChange,
  showLabel = false,
}: {
  value: AddressInput;
  onChange: (v: AddressInput) => void;
  showLabel?: boolean;
}) {
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-6">
      {showLabel ? (
        <Field label="Label (optional)" className="sm:col-span-6" hint="e.g. Home, Office, Farm">
          <input className={fieldCls} value={value.label ?? ""} onChange={set("label")} maxLength={40} />
        </Field>
      ) : null}
      <Field label="Full name" className="sm:col-span-3">
        <input required autoComplete="name" className={fieldCls} value={value.fullName} onChange={set("fullName")} />
      </Field>
      <Field label="Phone" className="sm:col-span-3" hint="The courier will call before delivery.">
        <input required type="tel" autoComplete="tel" minLength={5} className={fieldCls} value={value.phone} onChange={set("phone")} />
      </Field>
      <Field label="Street address" className="sm:col-span-6">
        <input required autoComplete="address-line1" className={fieldCls} value={value.line1} onChange={set("line1")} />
      </Field>
      <Field label="Apartment, suite, etc. (optional)" className="sm:col-span-6">
        <input autoComplete="address-line2" className={fieldCls} value={value.line2 ?? ""} onChange={set("line2")} />
      </Field>
      <Field label="City" className="sm:col-span-3">
        <input required autoComplete="address-level2" className={fieldCls} value={value.city} onChange={set("city")} />
      </Field>
      <Field label="State" className="sm:col-span-1">
        <NativeSelect required size="lg" className="h-11" value={value.state} onChange={set("state")} autoComplete="address-level1">
          <option value="" disabled>
            —
          </option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="ZIP code" className="sm:col-span-2">
        <input required autoComplete="postal-code" inputMode="numeric" minLength={3} className={fieldCls} value={value.postalCode} onChange={set("postalCode")} />
      </Field>
    </div>
  );
}

export function formatAddress(a: {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string | null;
}) {
  return [a.line1, a.line2, `${a.city}, ${a.state} ${a.postalCode}`, a.country].filter(Boolean).join(", ");
}
