"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTrip, updateTrip, createTripStop, updateTripStop, deleteTripStop } from "../../../lib/api";
import { useRequireAuth } from "../../../contexts/AuthContext";
import TripForm, { TripFormValues } from "../../../components/TripForm";
import { stopToFormState, stopFormToPayload } from "../../../components/Chapter";

export default function EditTripPage() {
  const auth = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [value, setValue] = useState<TripFormValues | null>(null);
  const [originalStopIds, setOriginalStopIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !id) return;
    getTrip(id)
      .then((trip) => {
        const sorted = [...trip.stops].sort((a, b) => a.order - b.order);
        setOriginalStopIds(sorted.map((s) => s.id));
        setValue({
          title: trip.title ?? "",
          start_date: trip.start_date,
          end_date: trip.end_date,
          travel_style: trip.travel_style,
          budget_level: trip.budget_level,
          stops: sorted.map((s) => ({ key: `existing-${s.id}`, id: s.id, form: stopToFormState(s) })),
        });
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [auth, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    if (!value.start_date || !value.end_date || !value.travel_style || !value.budget_level) {
      setSaveError("Fill in the trip dates, travel style, and budget before saving.");
      return;
    }
    setSubmitting(true);
    setSaveError("");
    try {
      await updateTrip(id, {
        title: value.title || null,
        start_date: value.start_date,
        end_date: value.end_date,
        travel_style: value.travel_style,
        budget_level: value.budget_level,
      });

      const keptIds = value.stops.filter((s) => s.id != null).map((s) => s.id as number);
      const removedIds = originalStopIds.filter((sid) => !keptIds.includes(sid));

      await Promise.all([
        ...value.stops.map((entry, i) => {
          const payload = stopFormToPayload(entry.form, i);
          return entry.id != null ? updateTripStop(id, entry.id, payload) : createTripStop(id, payload);
        }),
        ...removedIds.map((stopId) => deleteTripStop(id, stopId)),
      ]);

      router.push(`/trips/${id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  if (!auth) return null;

  if (loading) {
    return <div className="flex items-center justify-center h-64" style={{ color: "#8C8279" }}>Loading…</div>;
  }

  if (loadError || !value) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p style={{ color: "#B5696A" }}>{loadError || "Trip not found."}</p>
      </div>
    );
  }

  return (
    <TripForm
      heading="Edit trip"
      subheading="Update your memory."
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/trips/${id}`)}
      submitting={submitting}
      submitLabel={submitting ? "Saving…" : "Save changes"}
      error={saveError}
    />
  );
}
