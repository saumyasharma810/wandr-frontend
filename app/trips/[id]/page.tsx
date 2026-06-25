"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  TripPublic,
  TravelStyle,
  BudgetLevel,
} from "../../lib/types";
import {
  getTrip,
  deleteTrip,
  updateTrip,
  createTripStop,
  updateTripStop,
  deleteTripStop,
} from "../../lib/api";
import { resolveCityCoords } from "../../lib/geocode";
import { MOCK_TRIPS } from "../../lib/mock-data";
import { useAuth } from "../../contexts/AuthContext";
import ClientWorldMap from "../../components/ClientWorldMap";
import ClientCountryMap from "../../components/ClientCountryMap";
import { MapPin } from "../../components/WorldMap";
import Chapter, {
  StopFormState,
  emptyStopForm,
  stopToFormState,
  isStopFormComplete,
  stopFormToPayload,
} from "../../components/Chapter";
import { ChipSelector, inputStyle, COMPANION_OPTIONS, BUDGET_OPTIONS } from "../../components/FormControls";

const TRAVEL_STYLE_LABEL: Record<string, string> = {
  solo: "Solo",
  couple: "Couple",
  group: "Group",
  family: "Family",
};

const BUDGET_LABEL: Record<string, string> = {
  backpacker: "Budget",
  mid: "Mid-range",
  luxury: "Luxury",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type TripHeaderForm = {
  title: string;
  start_date: string;
  end_date: string;
  travel_style: TravelStyle | "";
  budget_level: BudgetLevel | "";
};

export default function TripDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [trip, setTrip] = useState<TripPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [singlePin, setSinglePin] = useState<{ city: string; lng: number; lat: number } | null>(null);

  const [editingHeader, setEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState<TripHeaderForm | null>(null);
  const [savingHeader, setSavingHeader] = useState(false);

  const [editingStopId, setEditingStopId] = useState<number | null>(null);
  const [stopForm, setStopForm] = useState<StopFormState | null>(null);
  const [savingStop, setSavingStop] = useState(false);

  const [addingStop, setAddingStop] = useState(false);
  const [newStopForm, setNewStopForm] = useState<StopFormState>(emptyStopForm());
  const [stopError, setStopError] = useState("");

  function loadTrip() {
    if (!id) return;
    getTrip(id)
      .then(setTrip)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const mock = MOCK_TRIPS.find((t) => t.id === Number(params.id));
      if (mock) {
        setTrip(mock as unknown as TripPublic);
      } else {
        window.location.href = "/auth";
      }
      setLoading(false);
      return;
    }
    loadTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, id, params.id]);

  // Resolve map coordinates for every stop — static lookup first, Mapbox fallback.
  useEffect(() => {
    if (!trip || trip.stops.length === 0) return;
    async function resolve() {
      const resolved = await Promise.all(
        trip!.stops.map(async (stop) => {
          const mock = stop as unknown as { lat?: number; lng?: number };
          const mockCoords = mock.lng != null && mock.lat != null ? { lng: mock.lng, lat: mock.lat } : null;
          const coords = mockCoords ?? (await resolveCityCoords(stop.city).then((c) => c ? { lng: c[0], lat: c[1] } : null));
          if (!coords) return null;
          return { id: stop.id, tripId: id, city: stop.city, country: stop.country, lng: coords.lng, lat: coords.lat, vibe: stop.vibe } as MapPin;
        })
      );
      const validPins = resolved.filter(Boolean) as MapPin[];
      if (validPins.length === 1) {
        setSinglePin({ city: validPins[0].city, lng: validPins[0].lng, lat: validPins[0].lat });
        setPins([]);
      } else {
        setSinglePin(null);
        setPins(validPins);
      }
    }
    resolve();
  }, [trip, id]);

  async function handleDeleteTrip() {
    if (!trip || !confirm(`Delete this trip?`)) return;
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      router.replace("/trips");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  function startEditHeader() {
    if (!trip) return;
    setHeaderForm({
      title: trip.title ?? "",
      start_date: trip.start_date,
      end_date: trip.end_date,
      travel_style: trip.travel_style,
      budget_level: trip.budget_level,
    });
    setEditingHeader(true);
  }

  const headerComplete = Boolean(
    headerForm?.start_date && headerForm?.end_date && headerForm?.travel_style && headerForm?.budget_level
  );

  async function saveHeader() {
    if (!trip || !headerForm || !headerComplete) return;
    setSavingHeader(true);
    try {
      const updated = await updateTrip(trip.id, {
        title: headerForm.title || null,
        start_date: headerForm.start_date,
        end_date: headerForm.end_date,
        travel_style: headerForm.travel_style as TravelStyle,
        budget_level: headerForm.budget_level as BudgetLevel,
      });
      setTrip(updated);
      setEditingHeader(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingHeader(false);
    }
  }

  function startEditStop(stopId: number) {
    const stop = trip?.stops.find((s) => s.id === stopId);
    if (!stop) return;
    setStopForm(stopToFormState(stop));
    setEditingStopId(stopId);
  }

  async function saveStop() {
    if (!trip || editingStopId == null || !stopForm || !isStopFormComplete(stopForm)) return;
    setSavingStop(true);
    try {
      await updateTripStop(trip.id, editingStopId, stopFormToPayload(stopForm));
      setEditingStopId(null);
      setStopForm(null);
      loadTrip();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save stop");
    } finally {
      setSavingStop(false);
    }
  }

  async function removeStop(stopId: number) {
    if (!trip) return;
    if (trip.stops.length <= 1) return;
    if (!confirm("Remove this stop?")) return;
    try {
      await deleteTripStop(trip.id, stopId);
      loadTrip();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove stop");
    }
  }

  async function saveNewStop() {
    if (!trip) return;
    if (!isStopFormComplete(newStopForm)) {
      setStopError("Fill in the city, dates, vibe, and would-return answer before adding this stop.");
      return;
    }
    setStopError("");
    try {
      await createTripStop(trip.id, stopFormToPayload(newStopForm, trip.stops.length));
      setAddingStop(false);
      setNewStopForm(emptyStopForm());
      loadTrip();
    } catch (e) {
      setStopError(e instanceof Error ? e.message : "Failed to add stop");
    }
  }

  if (authLoading) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#8C8279" }}>
        Loading…
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p style={{ color: "#B5696A" }}>{error || "Trip not found."}</p>
        <Link href="/trips" style={{ color: "#C4773B", textDecoration: "none" }}>← Back to trips</Link>
      </div>
    );
  }

  const sortedStops = [...trip.stops].sort((a, b) => a.order - b.order);
  const tags = [
    trip.travel_style ? TRAVEL_STYLE_LABEL[trip.travel_style] : null,
    trip.budget_level ? BUDGET_LABEL[trip.budget_level] : null,
  ].filter(Boolean) as string[];

  return (
    <div style={{ backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "#E8E2D9", maxWidth: "1200px", margin: "0 auto" }}>
        <nav className="flex items-center gap-2 text-sm" style={{ color: "#8C8279" }}>
          <Link href="/trips" style={{ color: "#8C8279", textDecoration: "none" }}>My Trips</Link>
          <span>/</span>
          <span style={{ color: "#2C2825" }}>{trip.title ?? trip.countries.join(", ")}</span>
        </nav>
      </div>

      {/* Trip-level header */}
      <div className="px-6 py-8 lg:px-12 border-b" style={{ borderColor: "#E8E2D9", maxWidth: "1200px", margin: "0 auto" }}>
        {!editingHeader ? (
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2C2825" }}>
                {trip.title ?? trip.countries.join(" → ")}
              </h1>
              <p className="text-sm mt-2" style={{ color: "#8C8279" }}>
                {trip.start_date ? formatDate(trip.start_date) : ""}
                {trip.end_date && trip.end_date !== trip.start_date ? ` – ${formatDate(trip.end_date)}` : ""}
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs" style={{ backgroundColor: "#F0E6D8", color: "#C4773B", borderRadius: "9999px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isAuthenticated && (
              <button
                onClick={startEditHeader}
                aria-label="Edit trip details"
                className="text-sm flex-shrink-0"
                style={{ color: "#8C8279", background: "none", border: "none", cursor: "pointer" }}
              >
                Edit
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5" style={{ maxWidth: "500px" }}>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>Title</label>
              <input
                type="text"
                value={headerForm!.title}
                onChange={(e) => setHeaderForm({ ...headerForm!, title: e.target.value })}
                placeholder="Three weeks in Japan"
                style={inputStyle(false)}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>From <span style={{ color: "#C4773B" }}>*</span></label>
                <input type="date" value={headerForm!.start_date} onChange={(e) => setHeaderForm({ ...headerForm!, start_date: e.target.value })} required style={inputStyle(false)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2C2825" }}>To <span style={{ color: "#C4773B" }}>*</span></label>
                <input type="date" value={headerForm!.end_date} min={headerForm!.start_date} onChange={(e) => setHeaderForm({ ...headerForm!, end_date: e.target.value })} required style={inputStyle(false)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Who did you go with? <span style={{ color: "#C4773B" }}>*</span></label>
              <ChipSelector options={COMPANION_OPTIONS} value={headerForm!.travel_style} onChange={(v) => setHeaderForm({ ...headerForm!, travel_style: v })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#2C2825" }}>Budget <span style={{ color: "#C4773B" }}>*</span></label>
              <ChipSelector options={BUDGET_OPTIONS} value={headerForm!.budget_level} onChange={(v) => setHeaderForm({ ...headerForm!, budget_level: v })} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveHeader}
                disabled={savingHeader || !headerComplete}
                className="px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: "#C4773B", borderRadius: "8px", border: "none", cursor: savingHeader || !headerComplete ? "not-allowed" : "pointer", opacity: savingHeader || !headerComplete ? 0.6 : 1 }}
              >
                {savingHeader ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditingHeader(false)}
                className="px-5 py-2.5 text-sm font-medium"
                style={{ backgroundColor: "transparent", border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 56px - 49px)" }}>
        {/* Left — chapters */}
        <div className="flex-1 lg:w-[55%] px-6 py-10 lg:px-12 overflow-y-auto">
          <div style={{ maxWidth: "600px" }}>
            {sortedStops.map((stop) =>
              editingStopId === stop.id && stopForm ? (
                <div key={stop.id} className="mb-10">
                  <Chapter mode="edit" stop={stopForm} onChange={setStopForm} />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={saveStop}
                      disabled={savingStop || !isStopFormComplete(stopForm)}
                      className="px-5 py-2.5 text-sm font-medium text-white"
                      style={{ backgroundColor: "#C4773B", borderRadius: "8px", border: "none", cursor: savingStop || !isStopFormComplete(stopForm) ? "not-allowed" : "pointer", opacity: savingStop || !isStopFormComplete(stopForm) ? 0.6 : 1 }}
                    >
                      {savingStop ? "Saving…" : "Save chapter"}
                    </button>
                    <button
                      onClick={() => { setEditingStopId(null); setStopForm(null); }}
                      className="px-5 py-2.5 text-sm font-medium"
                      style={{ backgroundColor: "transparent", border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Chapter
                  key={stop.id}
                  mode="read"
                  stop={stop}
                  onEdit={isAuthenticated ? () => startEditStop(stop.id) : undefined}
                  onRemove={isAuthenticated ? () => removeStop(stop.id) : undefined}
                  removable={isAuthenticated && trip.stops.length > 1}
                />
              )
            )}

            {isAuthenticated && trip.stops.length <= 1 && (
              <p className="text-xs mb-6" style={{ color: "#8C8279" }}>A trip needs at least one stop.</p>
            )}

            {isAuthenticated && (
              addingStop ? (
                <div className="mb-10">
                  <Chapter mode="edit" stop={newStopForm} onChange={setNewStopForm} onRemove={() => { setAddingStop(false); setNewStopForm(emptyStopForm()); setStopError(""); }} removable />
                  {stopError && <p className="text-sm mt-2" style={{ color: "#B5696A" }}>{stopError}</p>}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={saveNewStop}
                      disabled={!isStopFormComplete(newStopForm)}
                      className="px-5 py-2.5 text-sm font-medium text-white"
                      style={{ backgroundColor: "#C4773B", borderRadius: "8px", border: "none", cursor: !isStopFormComplete(newStopForm) ? "not-allowed" : "pointer", opacity: !isStopFormComplete(newStopForm) ? 0.6 : 1 }}
                    >
                      Add stop
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingStop(true)}
                  className="text-sm font-medium mb-10"
                  style={{ color: "#C4773B", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  + add a stop
                </button>
              )
            )}

            <div className="flex gap-3 flex-wrap pt-2">
              <Link
                href="/trips"
                className="px-4 py-2 text-sm font-medium"
                style={{ border: "1px solid #E8E2D9", borderRadius: "8px", color: "#2C2825", textDecoration: "none" }}
              >
                ← All trips
              </Link>
              {sortedStops[0]?.city && (
                <Link
                  href={`/tips?city=${encodeURIComponent(sortedStops[0].city)}`}
                  className="px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: "#F0E6D8", color: "#C4773B", borderRadius: "8px", textDecoration: "none" }}
                >
                  Tips for {sortedStops[0].city}
                </Link>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleDeleteTrip}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    border: "1px solid #B5696A",
                    borderRadius: "8px",
                    color: "#B5696A",
                    background: "transparent",
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? "Deleting…" : "Delete trip"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right — persistent map across all chapters */}
        <div className="lg:w-[45%] h-64 lg:h-auto lg:sticky lg:top-14" style={{ minHeight: "300px" }}>
          <div className="w-full h-full p-4 lg:p-6" style={{ minHeight: "300px" }}>
            {singlePin ? (
              <ClientCountryMap city={singlePin.city} lng={singlePin.lng} lat={singlePin.lat} vibe={sortedStops[0]?.vibe ?? "neutral"} />
            ) : pins.length > 0 ? (
              <ClientWorldMap
                pins={pins}
                initialZoom={trip.countries.length > 1 ? 2.5 : 4.5}
                initialCenter={[
                  pins.reduce((sum, p) => sum + p.lng, 0) / pins.length,
                  pins.reduce((sum, p) => sum + p.lat, 0) / pins.length,
                ]}
              />
            ) : (
              <div
                className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center px-8"
                style={{ backgroundColor: "#EDE8E0", minHeight: "300px" }}
              >
                <p className="text-sm" style={{ color: "#8C8279" }}>
                  Map unavailable for this trip
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
