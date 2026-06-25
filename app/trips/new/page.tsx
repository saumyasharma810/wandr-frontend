"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TripCreate } from "../../lib/types";
import { createTrip } from "../../lib/api";
import { useRequireAuth } from "../../contexts/AuthContext";
import TripForm, { TripFormValues, emptyTripForm } from "../../components/TripForm";
import { stopFormToPayload } from "../../components/Chapter";

export default function LogTripPage() {
  const auth = useRequireAuth();
  const router = useRouter();

  const [value, setValue] = useState<TripFormValues>(emptyTripForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    if (!value.start_date || !value.end_date || !value.travel_style || !value.budget_level) {
      setError("Fill in the trip dates, travel style, and budget before saving.");
      setSubmitting(false);
      return;
    }
    try {
      const payload: TripCreate = {
        title: value.title || null,
        start_date: value.start_date,
        end_date: value.end_date,
        travel_style: value.travel_style,
        budget_level: value.budget_level,
        is_public: false,
        stops: value.stops.map((entry, i) => stopFormToPayload(entry.form, i)),
      };
      const trip = await createTrip(payload);
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trip");
      setSubmitting(false);
    }
  }

  if (!auth) return null;

  return (
    <TripForm
      heading="Log a trip"
      subheading="Save this memory before it fades."
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitting={submitting}
      submitLabel={submitting ? "Saving…" : "Save this memory"}
      error={error}
    />
  );
}
