import { useState, useRef, useEffect } from "react";
import {
  Eye, EyeOff, Mail, Lock, ChevronRight, MapPin, ChevronDown,
  Moon, Sun, LogOut, ClipboardList, Package, RefreshCw, ArrowLeft,
  ScanLine, QrCode,
} from "lucide-react";
import bgImage from "../imports/ChatGPT_Image_Apr_28__2026__03_22_59_PM__1___1_.png";
import sustainscanLogoWhite from "../imports/logo_name_transparent-1.png";
import sustainscanLogoDark from "../imports/logo_name_horizontal_dark.png";
import controlUnionLogo from "../imports/CU_Logo_4_White_1.png";
import profilePhoto from "../imports/image.png";
import qrCode from "../imports/image-1.png";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginTab = "client" | "cu";
type Screen = "login" | "cu-signin" | "location" | "home" | "scan-log" | "register-log-form" | "log-inventory";
type InventoryTab = "all" | "modified";

interface FormState { email: string; password: string; showPassword: boolean; }

interface InventoryItem {
  id: number; species: string; length: number; diameter: number;
  volume: number; defectVolume: number; date: string; modified: boolean;
  logGroup?: string; serialNo?: number; batchNo?: string; defReason?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BG_URL = bgImage;

const GRADIENT = "linear-gradient(135deg,#1a45b5 0%,#0f2f8f 60%,#0a1f6b 100%)";

const CONCESSIONS = [
  "Borneo Rainforest Reserve",
  "Kalimantan Timur Block A",
  "Sumatra Highland Forest",
  "Papua New Guinea North",
  "Sarawak Timber Zone B",
  "Congo Basin East",
  "Amazon Sustainable Unit",
  "Mekong Delta Plantation",
  "West Africa Teak Reserve",
  "Baltic Mixed Forest",
  "Siberian Larch Zone",
  "Carpathian Oak Block",
];

const CU_CLIENTS = [
  "Control Union",
  "CU Indonesia",
  "CU Malaysia",
  "CU Singapore",
  "CU Thailand",
];

const CU_LOCATIONS = [
  "Horana BCH",
  "Jakarta Office",
  "Kuala Lumpur HQ",
  "Singapore Branch",
  "Bangkok Center",
];

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 1,  species: "Coconut", length: 10.0, diameter: 11.0, volume: 12.0,  defectVolume: 13.0, date: "2026-05-25", modified: false },
  { id: 2,  species: "Teak",    length: 11.0, diameter: 12.1, volume: 12.0,  defectVolume: 13.0, date: "2026-05-25", modified: false },
  { id: 3,  species: "Teak",    length:  4.0, diameter:  5.0, volume:  6.0,  defectVolume: 10.0, date: "2026-05-25", modified: true,
    logGroup: "Group 1", serialNo: 12, batchNo: "", defReason: "Reason" },
  { id: 4,  species: "Banana",  length: 11.1, diameter: 12.2, volume: 13.3,  defectVolume: 14.4, date: "2026-05-22", modified: true,
    logGroup: "Group 2", serialNo: 5,  batchNo: "B-022", defReason: "Crack" },
  { id: 5,  species: "Coconut", length: 10.0, diameter: 20.0, volume: 30.0,  defectVolume: 40.0, date: "2026-05-22", modified: false },
  { id: 6,  species: "Coconut", length: 10.0, diameter: 20.0, volume: 204.0, defectVolume: 10.0, date: "2026-05-22", modified: false },
  { id: 7,  species: "Coconut", length:  1.0, diameter:  2.0, volume:  3.0,  defectVolume:  4.0, date: "2026-05-22", modified: false },
  { id: 8,  species: "Meranti", length:  8.5, diameter:  9.2, volume: 15.3,  defectVolume:  2.1, date: "2026-05-20", modified: true,
    logGroup: "Group 3", serialNo: 8,  batchNo: "B-019", defReason: "Split end" },
  { id: 9,  species: "Teak",    length:  6.0, diameter:  7.5, volume:  9.0,  defectVolume:  1.5, date: "2026-05-20", modified: false },
  { id: 10, species: "Acacia",  length: 12.0, diameter: 14.0, volume: 22.5,  defectVolume:  3.0, date: "2026-05-18", modified: false },
];

const LAST_SYNC = new Date(Date.now() - 1000 * 60 * 47);

function formatSyncTime(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ─── Shared: blurred background ───────────────────────────────────────────────

function Background() {
  return (
    <>
      <div className="absolute inset-0 bg-emerald-900"
        style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: "cover", backgroundPosition: "18% center", filter: "blur(3px) brightness(0.68) saturate(1.15)", transform: "scale(1.05)" }}
        aria-hidden="true" />
      <div className="absolute inset-0" style={{ background: "rgba(10,22,70,0.45)" }} aria-hidden="true" />
    </>
  );
}

function PoweredBy() {
  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.45)" }}>Powered by</span>
      <img src={controlUnionLogo} alt="Control Union" className="h-7 object-contain drop-shadow-lg" />
    </div>
  );
}

// ─── Shared page header: Logo LEFT · [←][🌙][extra] RIGHT ─────────────────────

function PageHeader({ dark, onBack, onDarkToggle, extra }: {
  dark: boolean; onBack?: () => void; onDarkToggle?: () => void; extra?: React.ReactNode;
}) {
  const btn = { background: dark ? "rgba(255,255,255,0.1)" : "rgba(15,47,143,0.08)", color: dark ? "#ffffff" : "#0f2f8f" };
  return (
    <div className="flex items-center justify-between">
      <img src={sustainscanLogoDark} alt="SustainScan" className="h-9 object-contain"
        style={{ filter: dark ? "brightness(0) invert(1)" : "none" }} />
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none"
            style={btn} aria-label="Go back">
            <ArrowLeft size={17} />
          </button>
        )}
        {onDarkToggle && (
          <button onClick={onDarkToggle}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none"
            style={btn} aria-label={dark ? "Light mode" : "Dark mode"}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onSignIn, onCUSignIn }: { onSignIn: () => void; onCUSignIn: () => void }) {
  const [activeTab, setActiveTab] = useState<LoginTab>("client");
  const [clientForm, setClientForm] = useState<FormState>({ email: "", password: "", showPassword: false });

  useEffect(() => {
    (window as any).navigateToCU = onCUSignIn;
    return () => { delete (window as any).navigateToCU; };
  }, [onCUSignIn]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden animate-fadeIn" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Background />
      <div className="relative z-10 w-full max-w-[420px] mx-4 flex flex-col min-h-screen py-10 items-center justify-between gap-6">
        <div className="flex flex-col items-center gap-3 pt-4">
          <img src={sustainscanLogoWhite} alt="SustainScan" className="w-44 drop-shadow-2xl" style={{ filter: "brightness(0) invert(1)" }} />
        </div>

        {/* overflow-hidden kept here so tab active bg clips to rounded corners */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            {(["client", "cu"] as LoginTab[]).map(tab => {
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 py-4 text-sm font-semibold tracking-wide transition-all duration-200 focus:outline-none"
                  style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)", background: active ? "rgba(15,47,143,0.72)" : "transparent", borderBottom: active ? "2px solid #60a5fa" : "2px solid transparent" }}>
                  {tab === "client" ? "Log in as Client" : "Log in as CU"}
                </button>
              );
            })}
          </div>
          <form onSubmit={e => { e.preventDefault(); onSignIn(); }} className="px-7 py-8 flex flex-col gap-5">
            {activeTab === "client" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client-email" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)" }}>Email</label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <Mail size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                    <input id="client-email" type="email" placeholder="you@example.com" value={clientForm.email} onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40 text-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)" }}>Password</label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <Lock size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                    <input id="client-password" type={clientForm.showPassword ? "text" : "password"} placeholder="••••••••" value={clientForm.password} onChange={e => setClientForm(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40 text-white" />
                    <button type="button" onClick={() => setClientForm(p => ({ ...p, showPassword: !p.showPassword }))} className="focus:outline-none" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {clientForm.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none"
                  style={{ background: GRADIENT, boxShadow: "0 4px 24px rgba(15,47,143,0.5),inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                  Sign In <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 py-4">
                <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Sign in with your Control Union account to continue.
                </p>
                <button type="button" onClick={() => (window as any).navigateToCU?.()}
                  className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none"
                  style={{ background: GRADIENT, boxShadow: "0 4px 24px rgba(15,47,143,0.5),inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                  <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  Sign in with CU
                </button>
              </div>
            )}
          </form>
        </div>

        <PoweredBy />
      </div>
    </div>
  );
}

// ─── CU Sign-In Screen ────────────────────────────────────────────────────────

function CUSignInScreen({ onNext }: { onNext: (location: string) => void }) {
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden animate-fadeIn" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Background />
      <div className="relative z-10 w-full max-w-[420px] mx-4 flex flex-col min-h-screen py-10 items-center justify-between gap-6">
        <div className="flex flex-col items-center gap-3 pt-4">
          <img src={sustainscanLogoWhite} alt="SustainScan" className="w-44 drop-shadow-2xl" style={{ filter: "brightness(0) invert(1)" }} />
        </div>

        <div className="w-full rounded-3xl shadow-2xl"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <div className="px-7 py-8 flex flex-col gap-6">
            {/* Select Client */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)" }}>Select Client</label>
              <div className="relative">
                <button type="button" onClick={() => { setClientOpen(v => !v); setLocationOpen(false); }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-left transition-all duration-150 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.18)", border: `1px solid ${clientOpen ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.3)"}`, color: client ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  <span className="truncate">{client || "Select a client…"}</span>
                  <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.6)", transform: clientOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
                </button>
                {clientOpen && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl z-30"
                    style={{ background: "rgba(10,22,70,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxHeight: "200px", overflowY: "auto" }}>
                    {CU_CLIENTS.map(c => (
                      <button key={c} type="button" onClick={() => { setClient(c); setClientOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm transition-colors duration-100 hover:bg-white/10 focus:outline-none"
                        style={{ color: client === c ? "#93c5fd" : "rgba(255,255,255,0.85)", fontWeight: client === c ? 600 : 400, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Select Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)" }}>Select Location</label>
              <div className="relative">
                <button type="button" onClick={() => { setLocationOpen(v => !v); setClientOpen(false); }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-left transition-all duration-150 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.18)", border: `1px solid ${locationOpen ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.3)"}`, color: location ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  <span className="truncate">{location || "Select a location…"}</span>
                  <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.6)", transform: locationOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
                </button>
                {locationOpen && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl z-30"
                    style={{ background: "rgba(10,22,70,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxHeight: "200px", overflowY: "auto" }}>
                    {CU_LOCATIONS.map(loc => (
                      <button key={loc} type="button" onClick={() => { setLocation(loc); setLocationOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm transition-colors duration-100 hover:bg-white/10 focus:outline-none"
                        style={{ color: location === loc ? "#93c5fd" : "rgba(255,255,255,0.85)", fontWeight: location === loc ? 600 : 400, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => client && location && onNext(location)} disabled={!client || !location}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold shadow-lg transition-all duration-200 focus:outline-none"
              style={{ background: (client && location) ? GRADIENT : "rgba(255,255,255,0.12)", boxShadow: (client && location) ? "0 4px 24px rgba(15,47,143,0.5),inset 0 1px 0 rgba(255,255,255,0.15)" : "none", color: (client && location) ? "#fff" : "rgba(255,255,255,0.3)", cursor: (client && location) ? "pointer" : "not-allowed" }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ height: "1.25rem" }} />
        <PoweredBy />
      </div>
    </div>
  );
}

// ─── Location Screen ──────────────────────────────────────────────────────────

function LocationScreen({ onNext }: { onNext: (location: string) => void }) {
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden animate-fadeIn" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Background />
      <div className="relative z-10 w-full max-w-[420px] mx-4 flex flex-col min-h-screen py-10 items-center justify-between gap-6">
        <div className="flex flex-col items-center gap-3 pt-4">
          <img src={sustainscanLogoWhite} alt="SustainScan" className="w-44 drop-shadow-2xl" style={{ filter: "brightness(0) invert(1)" }} />
        </div>

        {/* No overflow-hidden here so the dropdown is never clipped */}
        <div className="w-full rounded-3xl shadow-2xl"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <div className="px-7 pt-8 pb-5 rounded-t-3xl" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(15,47,143,0.7)" }}>
                <MapPin size={17} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Select Concession</h2>
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>Choose the timber concession you are operating from.</p>
          </div>

          <div className="px-7 py-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)" }}>Timber Concession</label>
              {/* relative wrapper so dropdown positions against this, not the card */}
              <div className="relative">
                <button type="button" onClick={() => setOpen(v => !v)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-left transition-all duration-150 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.18)", border: `1px solid ${open ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.3)"}`, color: selected ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  <span className="truncate">{selected || "Select a concession…"}</span>
                  <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.6)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
                </button>
                {open && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl z-30"
                    style={{ background: "rgba(10,22,70,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxHeight: "260px", overflowY: "auto" }}>
                    {CONCESSIONS.map(loc => (
                      <button key={loc} type="button" onClick={() => { setSelected(loc); setOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm transition-colors duration-100 hover:bg-white/10 focus:outline-none"
                        style={{ color: selected === loc ? "#93c5fd" : "rgba(255,255,255,0.85)", fontWeight: selected === loc ? 600 : 400, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => selected && onNext(selected)} disabled={!selected}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold shadow-lg transition-all duration-200 focus:outline-none"
              style={{ background: selected ? GRADIENT : "rgba(255,255,255,0.12)", boxShadow: selected ? "0 4px 24px rgba(15,47,143,0.5),inset 0 1px 0 rgba(255,255,255,0.15)" : "none", color: selected ? "#fff" : "rgba(255,255,255,0.3)", cursor: selected ? "pointer" : "not-allowed" }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ height: "1.25rem" }} />
        <PoweredBy />
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ location, onLogout, onNavigate, onBackToLocation, dark, setDark }: {
  location: string; onLogout: () => void; onNavigate: (s: Screen) => void;
  onBackToLocation: () => void; dark: boolean; setDark: (v: boolean) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(LAST_SYNC);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg = dark ? "#0f172a" : "#ffffff";
  const surface = dark ? "#1e293b" : "#f8faff";
  const surfaceBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(15,47,143,0.1)";
  const textPrimary = dark ? "#ffffff" : "#0a1a4a";
  const textMuted = dark ? "#ffffff" : "#5a6a99";
  const cardBg = dark ? "#1e293b" : "#ffffff";
  const cardBorder = dark ? "rgba(255,255,255,0.08)" : "rgba(15,47,143,0.12)";
  const iconColor = dark ? "#ffffff" : "#0f2f8f";
  const iconBg = dark ? "rgba(255,255,255,0.12)" : "rgba(15,47,143,0.1)";
  const btn = { background: dark ? "rgba(255,255,255,0.1)" : "rgba(15,47,143,0.08)", color: iconColor };

  const ProfileButton = (
    <div className="relative" ref={profileRef}>
      <button onClick={() => setProfileOpen(v => !v)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-150 hover:scale-105 focus:outline-none"
        style={{ borderColor: profileOpen ? "#0f2f8f" : dark ? "rgba(255,255,255,0.2)" : "rgba(15,47,143,0.25)" }}>
        <img src={profilePhoto} alt="Thilina" className="w-full h-full object-cover" />
      </button>
      {profileOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl overflow-hidden z-30 shadow-xl"
          style={{ background: dark ? "#1e293b" : "#ffffff", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(15,47,143,0.12)"}` }}>
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(15,47,143,0.08)"}` }}>
            <p className="text-xs font-semibold" style={{ color: textPrimary }}>Thilina</p>
            <p className="text-[11px]" style={{ color: textMuted }}>Client</p>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50 focus:outline-none"
            style={{ color: "#d4183d" }}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full transition-colors duration-300 animate-fadeIn" style={{ background: bg, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col px-5 py-5 gap-6">

        {/* Logo left · [🌙][👤] right — no back button on home */}
        <PageHeader
          dark={dark}
          onDarkToggle={() => setDark(!dark)}
          extra={ProfileButton}
        />

        {/* ── Greeting card ── */}
        <div className="rounded-2xl px-5 py-5" style={{ background: GRADIENT, boxShadow: "0 4px 20px rgba(15,47,143,0.35)" }}>
          <p className="text-2xl font-bold tracking-tight text-white">Hello, Thilina 👋</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>{formatDate(new Date())}</p>
          <div className="flex items-center gap-2 mt-3">
            <MapPin size={14} style={{ color: "rgba(255,255,255,0.85)", flexShrink: 0 }} />
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{location}</span>
          </div>
        </div>

        {/* ── Action cards ── */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "rgba(255,255,255,0.55)" : "#5a6a99" }}>Actions</p>

          <button onClick={() => onNavigate("scan-log")}
            className="w-full rounded-2xl p-5 flex items-center gap-5 text-left group transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none shadow-sm hover:shadow-md"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
              <ClipboardList size={26} style={{ color: iconColor }} />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold" style={{ color: textPrimary }}>Register Log</p>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>Record new sustainability entry</p>
            </div>
            <ChevronRight size={18} style={{ color: textMuted }} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>

          <button onClick={() => onNavigate("log-inventory")}
            className="w-full rounded-2xl p-5 flex items-center gap-5 text-left group transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none shadow-sm hover:shadow-md"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
              <Package size={26} style={{ color: iconColor }} />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold" style={{ color: textPrimary }}>Log Inventory</p>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>Update stock and material records</p>
            </div>
            <ChevronRight size={18} style={{ color: textMuted }} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>
        </div>

        <div className="flex-1" />

        {/* ── Sync bar ── */}
        <div className="rounded-2xl px-5 py-4 flex flex-col gap-3" style={{ background: surface, border: `1px solid ${surfaceBorder}` }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>Last synced</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: textPrimary }}>{formatSyncTime(lastSync)}</p>
          </div>
          <button
            onClick={() => { setSyncing(true); setTimeout(() => { setLastSync(new Date()); setSyncing(false); }, 1800); }}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none disabled:opacity-60"
            style={{ background: GRADIENT, boxShadow: "0 4px 16px rgba(15,47,143,0.35)" }}>
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Scan Log Screen ──────────────────────────────────────────────────────────

function ScanLogScreen({ dark, onBack, onScanSuccess }: {
  dark: boolean; onBack: () => void; onScanSuccess: () => void;
}) {
  const bg = dark ? "#0f172a" : "#ffffff";
  const surface = dark ? "#1e293b" : "#f8faff";
  const surfaceBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(15,47,143,0.1)";
  const textPrimary = dark ? "#ffffff" : "#0a1a4a";
  const textMuted = dark ? "#ffffff" : "#5a6a99";

  const INSTRUCTIONS = [
    "Hold the camera steady 15–20 cm from the QR.",
    "Ensure good lighting for accurate scanning.",
    "If the QR code is valid, the system validates the data and opens the navigation form.",
  ];

  return (
    <div className="min-h-screen w-full transition-colors duration-300 animate-fadeIn" style={{ background: bg, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col px-5 py-5 gap-5">

        {/* Back button alone — top left */}
        <button onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none self-start"
          style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(15,47,143,0.08)", color: dark ? "#ffffff" : "#0f2f8f" }}
          aria-label="Go back">
          <ArrowLeft size={17} />
        </button>

        {/* Title: boxed icon + bold h1 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(15,47,143,0.1)" }}>
            <ScanLine size={20} style={{ color: dark ? "#ffffff" : "#0f2f8f" }} />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: dark ? "#ffffff" : "#0a1a4a" }}>Scan Log</h1>
        </div>

        <p className="text-sm -mt-1" style={{ color: textMuted }}>Tap the QR code below to register a new log entry.</p>

        {/* QR card — the QR itself is the tap target */}
        <div className="flex flex-col items-center gap-5 rounded-2xl px-6 py-8"
          style={{ background: surface, border: `1px solid ${surfaceBorder}` }}>
          <button
            onClick={onScanSuccess}
            className="relative focus:outline-none group active:scale-95 transition-transform duration-150"
            aria-label="Scan QR code">
            {["top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
              "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
              "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
              "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"].map((cls, i) => (
              <div key={i} className={`absolute w-7 h-7 ${cls}`} style={{ borderColor: "#0f2f8f", zIndex: 2 }} />
            ))}
            <img src={qrCode} alt="SustainScan QR Code"
              className="w-60 h-60 object-contain rounded-xl group-hover:opacity-85 transition-opacity duration-150"
              style={{ background: "#ffffff", padding: "8px" }} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: textPrimary }}>SustainScan Log Entry</p>
            <p className="text-xs mt-1" style={{ color: textMuted }}>Tap the QR code to scan and open the form</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl px-5 py-4" style={{ background: surface, border: `1px solid ${surfaceBorder}` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: textMuted }}>Instructions</p>
          {INSTRUCTIONS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: "rgba(15,47,143,0.1)", color: "#0f2f8f" }}>{i + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Register Log Form ────────────────────────────────────────────────────────

const PRODUCT_GROUPS = ["Hardwood", "Softwood", "Plywood", "MDF", "Veneer", "Chipboard"];
const PRODUCT_NAMES: Record<string, string[]> = {
  Hardwood:  ["Teak", "Meranti", "Merbau", "Keruing", "Balau"],
  Softwood:  ["Pine", "Spruce", "Fir", "Cedar", "Larch"],
  Plywood:   ["Structural Ply", "Marine Ply", "Commercial Ply"],
  MDF:       ["Standard MDF", "Moisture Resistant MDF", "Fire Retardant MDF"],
  Veneer:    ["Teak Veneer", "Oak Veneer", "Walnut Veneer"],
  Chipboard: ["Standard Chipboard", "Moisture Resistant Chipboard"],
};

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: "#0a1a4a" }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-blue-400 placeholder:text-gray-400";
const inputStyle = { background: "#f8faff", border: "1px solid #dce4f5", color: "#0a1a4a" };

function RegisterLogFormScreen({ onBack }: { onBack: () => void }) {
  const [productGroup, setProductGroup] = useState("");
  const [productName, setProductName] = useState("");
  const [pgOpen, setPgOpen] = useState(false);
  const [pnOpen, setPnOpen] = useState(false);

  const QR_CODE_VALUE = "d2aa277d-8739-467a-8e14-e3aee9680176";
  const TODAY = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen w-full animate-fadeIn" style={{ background: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col">

        {/* Header: back button, then title row below */}
        <div className="px-5 pt-5 pb-4 sticky top-0 z-20 bg-white flex flex-col gap-3"
          style={{ borderBottom: "1px solid #e8edf9" }}>
          <button onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none self-start"
            style={{ background: "rgba(15,47,143,0.08)", color: "#0f2f8f" }}
            aria-label="Go back">
            <ArrowLeft size={17} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(15,47,143,0.1)" }}>
              <ClipboardList size={20} style={{ color: "#0f2f8f" }} />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "#0a1a4a" }}>Register Log</h1>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 px-5 py-6 pb-10">

          {/* QR Code — read-only */}
          <FormField label="QR Code" required>
            <input className={inputCls} style={inputStyle} value={QR_CODE_VALUE} readOnly />
          </FormField>

          {/* Reg Date */}
          <FormField label="Reg Date" required>
            <div className="relative">
              <input type="date" className={inputCls} style={{ ...inputStyle, paddingRight: "2.5rem" }} defaultValue={TODAY} />
            </div>
          </FormField>

          {/* Product Group dropdown */}
          <FormField label="Product Group" required>
            <div className="relative">
              <button type="button" onClick={() => { setPgOpen(v => !v); setPnOpen(false); }}
                className="w-full rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none"
                style={{ ...inputStyle, color: productGroup ? "#0a1a4a" : "#9ca3af", border: pgOpen ? "1px solid #60a5fa" : "1px solid #dce4f5" }}>
                <span>{productGroup || "Select"}</span>
                <ChevronDown size={15} style={{ color: "#5a6a99", transform: pgOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              {pgOpen && (
                <div className="absolute left-0 right-0 mt-1 rounded-xl z-20 shadow-xl overflow-hidden"
                  style={{ background: "#ffffff", border: "1px solid #dce4f5", maxHeight: "200px", overflowY: "auto" }}>
                  {PRODUCT_GROUPS.map(g => (
                    <button key={g} type="button"
                      onClick={() => { setProductGroup(g); setProductName(""); setPgOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 focus:outline-none transition-colors"
                      style={{ color: productGroup === g ? "#0f2f8f" : "#0a1a4a", fontWeight: productGroup === g ? 600 : 400, borderBottom: "1px solid #f0f4ff" }}>
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          {/* Product Name dropdown */}
          <FormField label="Product Name" required>
            <div className="relative">
              <button type="button"
                onClick={() => { if (productGroup) { setPnOpen(v => !v); setPgOpen(false); } }}
                className="w-full rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none"
                style={{ ...inputStyle, color: productName ? "#0a1a4a" : "#9ca3af", border: pnOpen ? "1px solid #60a5fa" : "1px solid #dce4f5", opacity: productGroup ? 1 : 0.5 }}>
                <span>{productName || "Select"}</span>
                <ChevronDown size={15} style={{ color: "#5a6a99", transform: pnOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              {pnOpen && productGroup && (
                <div className="absolute left-0 right-0 mt-1 rounded-xl z-20 shadow-xl overflow-hidden"
                  style={{ background: "#ffffff", border: "1px solid #dce4f5", maxHeight: "200px", overflowY: "auto" }}>
                  {(PRODUCT_NAMES[productGroup] ?? []).map(n => (
                    <button key={n} type="button"
                      onClick={() => { setProductName(n); setPnOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 focus:outline-none transition-colors"
                      style={{ color: productName === n ? "#0f2f8f" : "#0a1a4a", fontWeight: productName === n ? 600 : 400, borderBottom: "1px solid #f0f4ff" }}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          {/* Lot Number */}
          <FormField label="Lot Number">
            <input className={inputCls} style={inputStyle} placeholder="Lot Number" />
          </FormField>

          {/* Measurements — 2-column pairs */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5a6a99" }}>Measurements</p>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Length", unit: "m" }, { label: "Diameter", unit: "cm" }].map(({ label, unit }) => (
                <FormField key={label} label={label} required>
                  <div className="relative">
                    <input type="number" className={inputCls} style={{ ...inputStyle, paddingRight: "2.5rem" }} placeholder="0.00" step="0.01" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none" style={{ color: "#94a3b8" }}>{unit}</span>
                  </div>
                </FormField>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Volume", unit: "m³" }, { label: "Defect Volume", unit: "m³" }].map(({ label, unit }) => (
                <FormField key={label} label={label} required>
                  <div className="relative">
                    <input type="number" className={inputCls} style={{ ...inputStyle, paddingRight: "2.5rem" }} placeholder="0.00" step="0.01" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none" style={{ color: "#94a3b8" }}>{unit}</span>
                  </div>
                </FormField>
              ))}
            </div>
          </div>

          {/* Note */}
          <FormField label="Note" required>
            <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} placeholder="Note" rows={3} />
          </FormField>

          {/* Status */}
          <FormField label="Status">
            <input className={inputCls} style={inputStyle} defaultValue="AVAILABLE" />
          </FormField>

          {/* Image capture */}
          <FormField label="Image" required>
            <button type="button"
              className="w-full rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-150 hover:bg-blue-50 focus:outline-none"
              style={{ background: "#f8faff", border: "1px solid #dce4f5", height: "140px" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#e8edf9" }}>
                <ScanLine size={20} style={{ color: "#5a6a99" }} />
              </div>
              <span className="text-sm" style={{ color: "#94a3b8" }}>Tap to capture image</span>
            </button>
          </FormField>

          {/* Submit */}
          <button type="button"
            className="w-full flex items-center justify-center rounded-xl py-4 text-sm font-bold text-white mt-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none"
            style={{ background: GRADIENT, boxShadow: "0 4px 16px rgba(15,47,143,0.35)" }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Row ────────────────────────────────────────────────────────────

function InventoryRow({ item, dark }: { item: InventoryItem; dark: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const textPrimary = dark ? "#ffffff" : "#0a1a4a";
  const textMuted = dark ? "rgba(255,255,255,0.65)" : "#5a6a99";
  const rowBg = dark ? "#1e293b" : "#ffffff";
  const rowBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(15,47,143,0.1)";
  const expandedBg = dark ? "#162032" : "#f0f5ff";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: rowBg, border: `1px solid ${rowBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Row header — always clickable */}
      <button className="w-full px-4 py-3.5 flex items-start justify-between gap-3 focus:outline-none"
        onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: textPrimary }}>{item.species}</span>
            {item.modified && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(15,47,143,0.12)", color: "#0f2f8f" }}>Modified</span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: textMuted }}>
            L: {item.length} · D: {item.diameter} · V: {item.volume} · DV: {item.defectVolume}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium" style={{ color: textMuted }}>{item.date}</span>
          <ChevronDown size={14} style={{ color: textMuted, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
        </div>
      </button>

      {/* Expanded panel — shown for every row */}
      {expanded && (
        <div className="px-4 pb-4 pt-3" style={{ background: expandedBg, borderTop: `1px solid ${rowBorder}` }}>
          {/* Detail fields — only shown if data exists */}
          {(item.logGroup || item.serialNo || item.batchNo !== undefined || item.defReason) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
              {[
                ["Log Group", item.logGroup ?? "—"],
                ["Serial No.", item.serialNo != null ? String(item.serialNo) : "—"],
                ["Batch No.", item.batchNo || "—"],
                ["Def. Reason", item.defReason ?? "—"],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: textMuted }}>{label}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: textPrimary }}>{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Change QR button — always present in expanded view */}
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.97] focus:outline-none"
            style={{ background: GRADIENT, color: "#ffffff", boxShadow: "0 2px 8px rgba(15,47,143,0.3)" }}>
            <QrCode size={13} />
            Change QR
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Log Inventory Screen ─────────────────────────────────────────────────────

function LogInventoryScreen({ dark, onBack }: { dark: boolean; onBack: () => void; }) {
  const [tab, setTab] = useState<InventoryTab>("all");

  const bg = dark ? "#0f172a" : "#ffffff";
  const textPrimary = dark ? "#ffffff" : "#0a1a4a";
  const textMuted = dark ? "rgba(255,255,255,0.6)" : "#5a6a99";

  const items = tab === "all" ? INVENTORY_ITEMS : INVENTORY_ITEMS.filter(i => i.modified);

  return (
    <div className="min-h-screen w-full transition-colors duration-300 animate-fadeIn" style={{ background: bg, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col px-5 py-5 gap-5">

        {/* Back button */}
        <button onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none self-start"
          style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(15,47,143,0.08)", color: dark ? "#ffffff" : "#0f2f8f" }}
          aria-label="Go back">
          <ArrowLeft size={17} />
        </button>

        {/* Title: boxed icon + bold h1 */}
        <div className="flex items-center gap-3 -mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(15,47,143,0.1)" }}>
            <Package size={20} style={{ color: dark ? "#ffffff" : "#0f2f8f" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: textPrimary }}>Log Inventory</h1>
            <p className="text-xs" style={{ color: textMuted }}>
              {INVENTORY_ITEMS.length} records · {INVENTORY_ITEMS.filter(i => i.modified).length} modified
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#e8edf9" }}>
          {(["all", "modified"] as InventoryTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none"
              style={{ background: tab === t ? GRADIENT : "transparent", color: tab === t ? "#ffffff" : textMuted, boxShadow: tab === t ? "0 2px 8px rgba(15,47,143,0.3)" : "none" }}>
              {t === "all" ? "All" : "Modified"}
              <span className="ml-1.5 text-[10px] font-bold opacity-75">
                ({t === "all" ? INVENTORY_ITEMS.length : INVENTORY_ITEMS.filter(i => i.modified).length})
              </span>
            </button>
          ))}
        </div>

        {/* Flat list — no date grouping */}
        <div className="flex flex-col gap-2 pb-6">
          {items.map(item => <InventoryRow key={item.id} item={item} dark={dark} />)}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package size={36} style={{ color: textMuted, opacity: 0.4 }} />
              <p className="text-sm" style={{ color: textMuted }}>No modified records found.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [location, setLocation] = useState("");
  const [dark, setDark] = useState(false);

  if (screen === "login") return <LoginScreen onSignIn={() => setScreen("location")} onCUSignIn={() => setScreen("cu-signin")} />;
  if (screen === "cu-signin") return <CUSignInScreen onNext={loc => { setLocation(loc); setScreen("home"); }} />;
  if (screen === "location") return <LocationScreen onNext={loc => { setLocation(loc); setScreen("home"); }} />;
  if (screen === "scan-log") return <ScanLogScreen dark={dark} onBack={() => setScreen("home")} onScanSuccess={() => setScreen("register-log-form")} />;
  if (screen === "register-log-form") return <RegisterLogFormScreen onBack={() => setScreen("scan-log")} />;
  if (screen === "log-inventory") return <LogInventoryScreen dark={dark} onBack={() => setScreen("home")} />;
  return <HomeScreen location={location} onLogout={() => setScreen("login")} onNavigate={setScreen}
    onBackToLocation={() => setScreen("location")} dark={dark} setDark={setDark} />;
}
