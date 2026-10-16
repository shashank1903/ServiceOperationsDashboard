import { useEffect, useMemo, useState } from "react";

type Status = "Healthy" | "Warning" | "Critical";
type Region = "Americas" | "EMEA" | "APAC";
type Country = "United States" | "Canada" | "Brazil" | "United Kingdom" | "Germany" | "South Africa" | "India" | "Singapore" | "Japan" | "Australia";
type Organization = "Radnet" | "Akumin" | "NorthwestStaffing";

type SessionUser = {
  name: string;
  email: string;
};

type Session = {
  remoteTechnologist: SessionUser;
  inSuiteAssistant: SessionUser;
  duration: string;
  browser: string;
  codec: string;
  bitrate: number;
  fps: number;
  resolution: string;
  mos: number;
};

type Peripheral = {
  name: string;
  type: "Camera" | "KM" | "Monitor" | "Audio" | "Service" | "Configuration";
  model: string;
  status: Status;
  connection: string;
  detail: string;
};

type Device = {
  id: string;
  name: string;
  site: string;
  region: Region;
  country: Country;
  state: string;
  organization: Organization;
  status: Status;
  latency: number;
  jitter: number;
  packetLoss: number;
  ip: string;
  lastSeen: string;
  session: Session | null;
  peripherals: Peripheral[];
  configuration: {
    dualMonitorMouseSupport: boolean;
  };
};

const sites = [
  ["New York Hub", "Americas", "United States"],
  ["Toronto North", "Americas", "Canada"],
  ["São Paulo Center", "Americas", "Brazil"],
  ["London Central", "EMEA", "United Kingdom"],
  ["Frankfurt Gateway", "EMEA", "Germany"],
  ["Cape Town South", "EMEA", "South Africa"],
  ["Mumbai West", "APAC", "India"],
  ["Singapore Hub", "APAC", "Singapore"],
  ["Tokyo East", "APAC", "Japan"],
  ["Sydney Harbor", "APAC", "Australia"],
] as const;

const organizations: Organization[] = ["Radnet", "Akumin", "NorthwestStaffing"];
type CpaasVendor = "Twilio" | "Amazon Chime SDK" | "Vonage" | "Daily.co";
const cpaasVendors: CpaasVendor[] = ["Twilio", "Amazon Chime SDK", "Vonage", "Daily.co"];

const countryMapPoints: Array<{ country: Country; x: number; y: number }> = [
  { country: "Canada", x: 49, y: 35 },
  { country: "United States", x: 50, y: 48 },
  { country: "Brazil", x: 79, y: 82 },
  { country: "United Kingdom", x: 111, y: 40 },
  { country: "Germany", x: 122, y: 44 },
  { country: "South Africa", x: 125, y: 91 },
  { country: "India", x: 157, y: 62 },
  { country: "Singapore", x: 172, y: 75 },
  { country: "Japan", x: 198, y: 50 },
  { country: "Australia", x: 198, y: 91 },
];

const operatingStates: Record<Country, string[]> = {
  "United States": ["California", "Texas", "New York", "Florida", "Illinois"],
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh", "Cardiff"],
  Germany: ["Bavaria", "Berlin", "Hesse", "Saxony", "North Rhine-Westphalia"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
  India: ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "West Bengal"],
  Singapore: ["Central Singapore Community Development Council", "South West Community Development Council", "South East Community Development Council", "North East Community Development Council", "North West"],
  Japan: ["Tokyo", "Ōsaka Prefecture", "Hokkaidō", "Aichi Prefecture", "Fukuoka Prefecture"],
  Australia: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia"],
};

const firstNames = ["Maya", "Jordan", "Elena", "Marcus", "Priya", "Daniel", "Sofia", "Noah", "Amara", "Ethan", "Chloe", "Liam", "Nina", "Owen", "Layla", "Mateo", "Ava", "Theo", "Zoe", "Caleb"];
const lastNames = ["Chen", "Brooks", "Rossi", "Wright", "Shah", "Kim", "Martinez", "Williams", "Okafor", "Bennett", "Dubois", "Patel", "Anders", "Rivera", "Nguyen", "Foster", "Park", "Lewis", "Silva", "Morgan"];

function makeUser(index: number, role: "rt" | "isa"): SessionUser {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}.${role}${index + 1}@relay.example`.toLowerCase(),
  };
}

const remoteTechnologists = Array.from({ length: 80 }, (_, index) => makeUser(index, "rt"));
const inSuiteAssistants = Array.from({ length: 250 }, (_, index) => makeUser(index, "isa"));

const devices: Device[] = Array.from({ length: 500 }, (_, index) => {
  const n = index + 1;
  const [site, region, country] = sites[index % sites.length];
  const state = operatingStates[country][Math.floor(index / sites.length) % operatingStates[country].length];
  const organization = organizations[index % organizations.length];
  const critical = index % 29 === 0 || index === 137;
  const warning = !critical && (index % 9 === 0 || index % 17 === 0);
  const status: Status = critical ? "Critical" : warning ? "Warning" : "Healthy";
  const severity = status === "Critical" ? 2 : status === "Warning" ? 1 : 0;
  const hasSession = index % 3 === 0 || index % 11 === 0;
  const activeOrdinal = Math.floor(index / 3) + Math.floor(index / 11) - Math.floor(index / 33);
  const peripheralStatus = (criticalEvery: number, warningEvery: number): Status =>
    n % criticalEvery === 0 ? "Critical" : n % warningEvery === 0 ? "Warning" : "Healthy";

  return {
    id: `RM-${String(n).padStart(3, "0")}`,
    name: `Room ${String(n).padStart(3, "0")}`,
    site,
    region,
    country,
    state,
    organization,
    status,
    latency: severity ? 42 + ((n * 13) % 75) * severity : 12 + ((n * 7) % 18),
    jitter: severity ? 14 + ((n * 5) % 24) * severity : 2 + ((n * 3) % 7),
    packetLoss: severity ? Number((0.6 + ((n * 11) % 26) / 10).toFixed(1)) : Number(((n % 4) / 10).toFixed(1)),
    ip: `10.${12 + (index % 8)}.${Math.floor(index / 254)}.${(index % 254) + 1}`,
    lastSeen: status === "Critical" ? `${2 + (n % 7)}m ago` : "Just now",
    session: hasSession ? {
      remoteTechnologist: remoteTechnologists[Math.floor(activeOrdinal / 3)],
      inSuiteAssistant: inSuiteAssistants[activeOrdinal],
      duration: `${12 + ((n * 7) % 108)}m`,
      browser: index % 4 === 0 ? "Microsoft Edge 125" : "Google Chrome 126",
      codec: index % 5 === 0 ? "VP9" : "H.264",
      bitrate: 1450 + ((n * 37) % 1350),
      fps: status === "Critical" ? 18 : status === "Warning" ? 24 : 30,
      resolution: status === "Critical" ? "1280 × 720" : "1920 × 1080",
      mos: Number((status === "Critical" ? 2.8 + (n % 4) / 10 : status === "Warning" ? 3.6 + (n % 5) / 10 : 4.3 + (n % 4) / 10).toFixed(1)),
    } : null,
    configuration: {
      dualMonitorMouseSupport: n % 5 !== 0,
    },
    peripherals: [
      {
        name: "Patient camera",
        type: "Camera",
        model: "Sony SRG-X40UH",
        status: peripheralStatus(31, 13),
        connection: "USB 3.0",
        detail: "1080p · 30 fps",
      },
      {
        name: "Contrast camera",
        type: "Camera",
        model: "Logitech Rally",
        status: peripheralStatus(37, 17),
        connection: "USB 3.0",
        detail: "1080p · 30 fps",
      },
      {
        name: "ISA camera",
        type: "Camera",
        model: "Logitech Brio",
        status: peripheralStatus(41, 19),
        connection: "USB 3.0",
        detail: "1080p · 30 fps",
      },
      {
        name: "KM cable",
        type: "KM",
        model: "",
        status: peripheralStatus(43, 23),
        connection: "USB-A – USB-C cable",
        detail: "Keyboard + mouse connected",
      },
      {
        name: "Monitor 1",
        type: "Monitor",
        model: "HDMI capture card",
        status: peripheralStatus(47, 29),
        connection: "HDMI",
        detail: "Landscape · 1920 × 1080",
      },
      {
        name: "Monitor 2",
        type: "Monitor",
        model: "HDMI capture card",
        status: peripheralStatus(53, 31),
        connection: "HDMI",
        detail: `${n % 2 === 0 ? "Portrait · 1080 × 1920" : "Landscape · 1920 × 1080"}`,
      },
      {
        name: "Speaker",
        type: "Audio",
        model: "Jabra room speaker",
        status: peripheralStatus(59, 37),
        connection: "USB-C",
        detail: "Output 68% · Signal normal",
      },
      {
        name: "Mic",
        type: "Audio",
        model: "Jabra room microphone",
        status: peripheralStatus(61, 41),
        connection: "USB-C",
        detail: "Input −18 dB · Signal normal",
      },
      {
        name: "CPaaS vendor",
        type: "Service",
        model: cpaasVendors[index % cpaasVendors.length],
        status: peripheralStatus(67, 47),
        connection: "Cloud service",
        detail: "Voice, video + signaling",
      },
      {
        name: "Codec configuration",
        type: "Configuration",
        model: `${index % 5 === 0 ? "VP9" : "H.264"} video`,
        status: peripheralStatus(71, 43),
        connection: "Opus audio",
        detail: "1080p · 30 fps · Hardware accelerated",
      },
      {
        name: "ISA App",
        type: "Configuration",
        model: `Version 3.${(n % 8) + 2}.${n % 10}`,
        status: peripheralStatus(73, 47),
        connection: "Windows application",
        detail: "Running",
      },
    ],
  };
});

const statusStyles: Record<Status, { dot: string; pill: string; cell: string }> = {
  Healthy: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    cell: "bg-emerald-400 hover:bg-emerald-500",
  },
  Warning: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/15",
    cell: "bg-amber-400 hover:bg-amber-500",
  },
  Critical: {
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 ring-red-600/15",
    cell: "bg-red-500 hover:bg-red-600",
  },
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "grid" | "monitor" | "alert" | "settings" | "search" | "bell" | "arrow" | "close" | "network" | "clock" | "pulse" | "chevron" | "user" | "video" | "audio" | "keyboard" | "capture" | "sun" | "moon" | "expand";
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    monitor: <><rect x="2.5" y="4" width="19" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></>,
    alert: <><path d="M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 3h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    network: <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M12 7v4m0 0-7 5m7-5 7 5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    command: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" /><circle cx="12" cy="11" r="2.5" /><path d="M12 8.5V5m-2.2 7.8-3 1.7m7.4-1.7 3 1.7" /><circle cx="12" cy="5" r=".7" fill="currentColor" stroke="none" /><circle cx="6.8" cy="14.5" r=".7" fill="currentColor" stroke="none" /><circle cx="17.2" cy="14.5" r=".7" fill="currentColor" stroke="none" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
    audio: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" /></>,
    keyboard: <><rect x="2" y="7" width="13" height="9" rx="1.5" /><path d="M4.5 10h.01M7 10h.01M9.5 10h.01M12 10h.01M4.5 13h8" /><rect x="17" y="8" width="5" height="8" rx="2.5" /><path d="M19.5 8V6.5c0-2-1.5-3.5-3.5-3.5h-2m5.5 7v1.5" /><path d="M12 3h2v3h-2z" /></>,
    capture: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h10v6H7zM3 10H1m2 4H1m22-4h-2m2 4h-2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
    expand: <><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" /><path d="m3 8 6-6m12 6-6-6M3 16l6 6m12-6-6 6" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

function peripheralIcon(type: Peripheral["type"]): "video" | "keyboard" | "capture" | "audio" | "network" | "settings" {
  if (type === "Camera") return "video";
  if (type === "KM") return "keyboard";
  if (type === "Monitor") return "capture";
  if (type === "Service") return "network";
  if (type === "Configuration") return "settings";
  return "audio";
}

function orderedPeripherals(items: Peripheral[]): Peripheral[] {
  return [...items].sort((a, b) => Number(b.name === "ISA App") - Number(a.name === "ISA App"));
}

function peripheralDevices(items: Peripheral[]): Peripheral[] {
  return items.filter((item) => !["ISA App", "CPaaS vendor", "Codec configuration"].includes(item.name));
}

function isaAppDetails(items: Peripheral[]): Peripheral | undefined {
  return items.find((item) => item.name === "ISA App");
}

function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status].pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[status].dot}`} />
      {status}
    </span>
  );
}

function MetricCard({ label, value, unit, state, detail }: { label: string; value: string; unit: string; state: Status; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`h-2 w-2 rounded-full ${statusStyles[state].dot}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}

function DevicePage({ device, onBack }: { device: Device; onBack: () => void }) {
  const deviceNumber = Number(device.id.split("-")[1]);
  const cpuLoad = 18 + (deviceNumber % 37);
  const cpuTemperature = 42 + (deviceNumber % 28);
  const memoryUse = 42 + (deviceNumber % 29);
  const diskUse = 32 + (deviceNumber % 41);
  const isaApp = isaAppDetails(device.peripherals);
  const cpaasVendor = device.peripherals.find((item) => item.name === "CPaaS vendor");
  const codecConfiguration = device.peripherals.find((item) => item.name === "Codec configuration");
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  return (
    <>
      <button onClick={onBack} className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-600"><Icon name="chevron" className="h-4 w-4 rotate-180" />Back to right-side view</button>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20"><Icon name="monitor" className="h-6 w-6" /></div>
          <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-tight">{device.name}</h1><StatusPill status={device.status} /></div><p className="mt-1 text-xs font-semibold text-slate-500">{device.organization}</p><p className="mt-0.5 text-[10px] text-slate-400">{device.id} · {device.site}</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />LIVE TELEMETRY</span><button onClick={toggleFullscreen} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><Icon name="expand" className="h-3.5 w-3.5" />{isFullscreen ? "Exit full screen" : "Full screen"}</button><button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50">Restart agent</button><button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500">Run diagnostics</button></div>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="TechLive heartbeat" value={device.status === "Critical" ? "Delayed" : "Online"} unit="" state={device.status === "Critical" ? "Warning" : "Healthy"} detail="Current device state" />
        <MetricCard label="Network latency" value={String(device.latency)} unit="ms" state={device.latency > 70 ? "Critical" : device.latency > 35 ? "Warning" : "Healthy"} detail="Target: below 35 ms" />
        <MetricCard label="Jitter" value={String(device.jitter)} unit="ms" state={device.jitter > 30 ? "Critical" : device.jitter > 10 ? "Warning" : "Healthy"} detail="Target: below 10 ms" />
        <MetricCard label="Packet loss" value={String(device.packetLoss)} unit="%" state={device.packetLoss > 2 ? "Critical" : device.packetLoss > 0.5 ? "Warning" : "Healthy"} detail="Target: below 0.5%" />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-800">Device status</h2><p className="mt-1 text-xs text-slate-400">Hardware, agent, and operating system</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">ONLINE</span></div>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {[
                ["CPU", `${cpuLoad}% utilized`],
                ["CPU Temperature", `${cpuTemperature}°C`],
                ["Memory", `${memoryUse}% utilized`],
                ["Disks", `${diskUse}% used · ${512 - Math.round((512 * diskUse) / 100)} GB free`],
                ["Network Adapter", "Intel I219-LM · 1 Gbps"],
                ["Public IP", device.ip],
                ["Firmware", `SL-${2025}.${(deviceNumber % 6) + 1}`],
                ["Windows patch status", deviceNumber % 8 === 0 ? "Update pending" : "Current"],
                ["NinjaOne Link", "Open device"],
              ].map(([label, value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>{label === "NinjaOne Link" ? <a href="https://us2.ninjarmm.com/#/deviceDashboard/566/overview" target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">Open device <Icon name="arrow" className="h-3 w-3 -rotate-45" /></a> : <p className={`mt-1 text-xs font-semibold ${(label === "Windows patch status" && value === "Update pending") || (label === "CPU Temperature" && cpuTemperature > 65) ? "text-amber-600" : "text-slate-700"}`}>{value}</p>}</div>)}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-500">Current resource utilization</span><span className="text-slate-400">CPU {cpuLoad}% · Memory {memoryUse}%</span></div>
              <div className="mt-2 flex gap-1">{Array.from({ length: 20 }, (_, index) => <span key={index} className={`h-2 flex-1 rounded-sm ${index < Math.round(cpuLoad / 5) ? cpuLoad > 75 ? "bg-red-500" : "bg-blue-500" : "bg-slate-100"}`} />)}</div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-800">Peripheral Health & Configurations</h2><p className="mt-1 text-xs text-slate-400">Connected devices and service settings</p></div><span className="text-[10px] font-semibold text-slate-400">{device.peripherals.filter((item) => item.status === "Healthy").length} of {device.peripherals.length} healthy</span></div>
            {isaApp && (
              <div className="mt-4 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="flex items-center gap-3 border-b border-blue-100 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-600 text-white"><Icon name="settings" className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold text-slate-800">ISA App & Device Configuration</p><span className={`h-2 w-2 rounded-full ${statusStyles[isaApp.status].dot}`} /></div><p className="mt-0.5 text-[10px] text-slate-500">{isaApp.model} · {isaApp.connection}</p></div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">RUNNING</span>
                </div>
                <div className="grid grid-cols-1 gap-px bg-blue-100 sm:grid-cols-3">
                  {[
                    ["CPaaS Vendor", cpaasVendor?.model ?? "Not configured", cpaasVendor?.status ?? "Warning"],
                    ["Codec", codecConfiguration ? `${codecConfiguration.model} · ${codecConfiguration.connection}` : "Not configured", codecConfiguration?.status ?? "Warning"],
                    ["Dual Monitor Mouse Support", device.configuration.dualMonitorMouseSupport ? "True" : "False", device.configuration.dualMonitorMouseSupport ? "Healthy" : "Warning"],
                  ].map(([label, value, state]) => (
                    <div key={label as string} className="bg-white/90 p-3">
                      <p className="text-[9px] font-medium text-slate-400">{label as string}</p>
                      <div className="mt-1.5 flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${statusStyles[state as Status].dot}`} /><p className="text-[10px] font-bold text-slate-700">{value as string}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {peripheralDevices(device.peripherals).map((peripheral) => (
                <div key={peripheral.name} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${peripheral.status === "Critical" ? "bg-red-50 text-red-600" : peripheral.status === "Warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Icon name={peripheralIcon(peripheral.type)} className="h-[18px] w-[18px]" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{peripheral.name}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">{[peripheral.model, peripheral.connection].filter(Boolean).join(" · ")}</p><p className="mt-0.5 text-[9px] font-medium text-slate-500">{peripheral.detail}</p></div>
                  <span className={`h-2 w-2 rounded-full ${statusStyles[peripheral.status].dot}`} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-800">Current network path</h2><p className="mt-1 text-xs text-slate-400">{device.country} · {device.region}</p></div><span className="text-[10px] font-semibold text-emerald-600">CONNECTED</span></div>
            <div className="mt-6 flex items-center">
              {[["Device", device.ip], ["Edge", device.region], ["TURN", "Central"], ["Service", `${device.latency} ms`]].map(([label, value], index) => <div key={label} className="contents"><div className="min-w-0 flex-1 text-center"><div className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${index === 3 && device.status !== "Healthy" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Icon name={index === 0 ? "monitor" : "network"} className="h-4 w-4" /></div><p className="mt-2 text-[10px] font-bold text-slate-600">{label}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">{value}</p></div>{index < 3 && <div className="mb-7 h-px w-4 bg-emerald-300" />}</div>)}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-800">Active session</h2><p className="mt-1 text-xs text-slate-400">Users and WebRTC media status</p></div>{device.session ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">CONNECTED · {device.session.duration}</span> : <span className="text-[10px] font-semibold text-slate-400">AVAILABLE</span>}</div>
            {device.session ? <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">{[["Remote Technologist", device.session.remoteTechnologist], ["In-Suite Assistant", device.session.inSuiteAssistant]].map(([role, person]) => { const user = person as SessionUser; return <div key={role as string} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700">{user.name.split(" ").map((part) => part[0]).join("")}</div><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{role as string}</p><p className="truncate text-xs font-semibold text-slate-700">{user.name}</p></div></div>; })}</div>
              <div className="mt-4 grid grid-cols-3 gap-2">{[["MOS", device.session.mos], ["Bitrate", `${device.session.bitrate} kbps`], ["Video", `${device.session.resolution}`], ["Frame rate", `${device.session.fps} fps`], ["Codec", device.session.codec], ["Packet loss", `${device.packetLoss}%`]].map(([label, value]) => <div key={label as string} className="rounded-lg border border-slate-100 p-2.5"><p className="text-[9px] text-slate-400">{label as string}</p><p className="mt-1 text-xs font-bold text-slate-700">{value as React.ReactNode}</p></div>)}</div>
            </> : <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center"><Icon name="user" className="mx-auto h-5 w-5 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">No active session</p></div>}
          </section>
        </div>
      </div>
    </>
  );
}

function UsersView({ onSelectRoom }: { onSelectRoom: (roomId: string) => void }) {
  const [role, setRole] = useState<"isa" | "rt">("isa");
  const [userSearch, setUserSearch] = useState("");
  const directory = role === "isa" ? inSuiteAssistants : remoteTechnologists;
  const assignments = useMemo(() => {
    const map = new Map<string, Device[]>();
    devices.forEach((device) => {
      if (!device.session) return;
      const user = role === "isa" ? device.session.inSuiteAssistant : device.session.remoteTechnologist;
      map.set(user.email, [...(map.get(user.email) ?? []), device]);
    });
    return map;
  }, [role]);
  const visibleUsers = directory
    .filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(userSearch.toLowerCase()))
    .sort((a, b) => {
      const activeDifference = Number(assignments.has(b.email)) - Number(assignments.has(a.email));
      return activeDifference || a.name.localeCompare(b.name);
    });
  const activeCount = directory.filter((user) => assignments.has(user.email)).length;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Users</h1>
            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">Real-time assignments</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">See who is online and which rooms they are currently connected to.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400"><Icon name="clock" className="h-4 w-4" />Telemetry received 8 seconds ago</div>
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button onClick={() => setRole("isa")} className={`rounded-md px-4 py-2 text-xs font-semibold transition ${role === "isa" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>In-Suite Assistants</button>
            <button onClick={() => setRole("rt")} className={`rounded-md px-4 py-2 text-xs font-semibold transition ${role === "rt" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Remote Technologists</button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs"><span className="h-2 w-2 rounded-full bg-emerald-500" /><strong className="text-emerald-700">{activeCount} active</strong><span className="text-emerald-600">of {directory.length}</span></div>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users" className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">User</p>
          <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Current room assignments</p><p className="mt-0.5 text-[9px] text-slate-400">{role === "rt" ? "Up to 3 rooms per technologist" : "1 room per assistant"}</p></div>
        </div>
        <div className="divide-y divide-slate-100">
          {visibleUsers.map((user) => {
            const rooms = assignments.get(user.email) ?? [];
            const active = rooms.length > 0;
            return (
              <div key={user.email} className={`flex min-h-16 items-center justify-between gap-4 overflow-hidden px-5 py-3.5 transition ${active ? "bg-white" : "bg-slate-50/30"}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-bold ${active ? role === "rt" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-400"}`}>
                    {user.name.split(" ").map((part) => part[0]).join("")}
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </div>
                  <div className="min-w-0"><div className="flex items-center gap-2"><p className={`truncate text-xs font-bold ${active ? "text-slate-800" : "text-slate-500"}`}>{user.name}</p>{active && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">ACTIVE</span>}</div><p className="mt-0.5 truncate text-[10px] text-slate-400">{user.email}</p></div>
                </div>
                <div className="flex min-w-0 flex-nowrap items-center justify-end gap-2 overflow-x-auto">
                  {rooms.map((room) => (
                    <button key={room.id} onClick={() => onSelectRoom(room.id)} className="group flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-400">
                      <span className={`h-2 w-2 rounded-full ${statusStyles[room.status].dot}`} />
                      <span><span className="block text-[11px] font-bold text-slate-700">{room.name}</span><span className="block text-[9px] text-slate-400">{room.site}</span></span>
                      <Icon name="chevron" className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5" />
                    </button>
                  ))}
                  {!active && <span className="shrink-0 text-[11px] font-medium text-slate-400">Not connected</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-[11px] text-slate-400"><span>{visibleUsers.length} users</span><span>Active users shown first</span></div>
      </section>
    </>
  );
}

function RoomsView({ onSelectRoom }: { onSelectRoom: (roomId: string) => void }) {
  const [organizationFilter, setOrganizationFilter] = useState<"All" | Organization>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [sessionFilter, setSessionFilter] = useState<"All" | "Active" | "Available">("All");
  const [roomSearch, setRoomSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({});

  type AdvancedField = {
    key: string;
    label: string;
    value: string;
    setValue: (value: string) => void;
    options: string[];
    matches: (device: Device, value: string) => boolean;
  };
  type AdvancedCategory = {
    title: string;
    description: string;
    fields: AdvancedField[];
  };
  const setAdvancedFilter = (key: string, value: string) => {
    setAdvancedFilters((current) => {
      const next = { ...current };
      if (value === "All") delete next[key];
      else next[key] = value;
      return next;
    });
  };
  const field = (key: string, label: string, options: string[], matches: AdvancedField["matches"]): AdvancedField => ({
    key,
    label,
    value: advancedFilters[key] ?? "All",
    setValue: (value) => setAdvancedFilter(key, value),
    options: ["All", ...options],
    matches,
  });
  const peripheral = (device: Device, name: string) => device.peripherals.find((item) => item.name === name);
  const healthOptions = ["Healthy", "Warning", "Critical"];
  const rangeMatch = (value: string, actual: number, ranges: Record<string, [number, number]>) => {
    const [minimum, maximum] = ranges[value];
    return actual >= minimum && actual < maximum;
  };
  const advancedCategories: AdvancedCategory[] = [
    {
      title: "Room & geography",
      description: "Identity, ownership, location, and overall room state",
      fields: [
        {
          key: "organization",
          label: "Organization",
          value: organizationFilter,
          setValue: (value) => setOrganizationFilter(value as "All" | Organization),
          options: ["All", ...organizations],
          matches: () => true,
        },
        {
          key: "room-health",
          label: "Room health",
          value: statusFilter,
          setValue: (value) => setStatusFilter(value as "All" | Status),
          options: ["All", ...healthOptions],
          matches: () => true,
        },
        field("region", "Region", ["Americas", "EMEA", "APAC"], (device, value) => device.region === value),
        field("country", "Country", countryMapPoints.map((point) => point.country), (device, value) => device.country === value),
        field("state", "State / province", Object.values(operatingStates).flat(), (device, value) => device.state === value),
        field("site", "Site", sites.map(([site]) => site), (device, value) => device.site === value),
      ],
    },
    {
      title: "Network",
      description: "Live connectivity, performance thresholds, and addressing",
      fields: [
        field("latency", "Latency", ["Under 35 ms", "35–70 ms", "Over 70 ms"], (device, value) => rangeMatch(value, device.latency, { "Under 35 ms": [0, 35], "35–70 ms": [35, 71], "Over 70 ms": [71, Infinity] })),
        field("jitter", "Jitter", ["Under 10 ms", "10–30 ms", "Over 30 ms"], (device, value) => rangeMatch(value, device.jitter, { "Under 10 ms": [0, 10], "10–30 ms": [10, 31], "Over 30 ms": [31, Infinity] })),
        field("packet-loss", "Packet loss", ["Under 0.5%", "0.5–2%", "Over 2%"], (device, value) => rangeMatch(value, device.packetLoss, { "Under 0.5%": [0, 0.5], "0.5–2%": [0.5, 2.1], "Over 2%": [2.1, Infinity] })),
        field("reporting", "Reporting state", ["Live", "Delayed"], (device, value) => value === "Live" ? device.lastSeen === "Just now" : device.lastSeen !== "Just now"),
        field("ip-subnet", "IP subnet", Array.from({ length: 8 }, (_, index) => `10.${12 + index}.x.x`), (device, value) => device.ip.startsWith(`${value.slice(0, -3)}`)),
      ],
    },
    {
      title: "Hardware & peripherals",
      description: "Connected room equipment, models, interfaces, and individual health",
      fields: [
        field("peripheral-health", "Overall peripheral health", ["All healthy", "Needs attention"], (device, value) => value === "All healthy" ? device.peripherals.every((item) => item.status === "Healthy") : device.peripherals.some((item) => item.status !== "Healthy")),
        field("device-model", "Device model", Array.from(new Set(devices.flatMap((device) => device.peripherals.map((item) => item.model).filter(Boolean)))).sort(), (device, value) => device.peripherals.some((item) => item.model === value)),
        field("connection", "Connection type", Array.from(new Set(devices.flatMap((device) => device.peripherals.map((item) => item.connection)))).sort(), (device, value) => device.peripherals.some((item) => item.connection === value)),
        ...["Patient camera", "Contrast camera", "ISA camera", "KM cable", "Monitor 1", "Monitor 2", "Speaker", "Mic"].map((name) =>
          field(name.toLowerCase().replaceAll(" ", "-"), name, healthOptions, (device, value) => peripheral(device, name)?.status === value)),
      ],
    },
    {
      title: "Session & WebRTC",
      description: "Occupancy, connected clients, and live media quality",
      fields: [
        {
          key: "session-state",
          label: "Session state",
          value: sessionFilter,
          setValue: (value) => setSessionFilter(value as "All" | "Active" | "Available"),
          options: ["All", "Active", "Available"],
          matches: () => true,
        },
        field("browser", "Browser", ["Google Chrome 126", "Microsoft Edge 125"], (device, value) => device.session?.browser === value),
        field("session-codec", "Session video codec", ["H.264", "VP9"], (device, value) => device.session?.codec === value),
        field("bitrate", "Bitrate", ["Under 2 Mbps", "2–2.5 Mbps", "Over 2.5 Mbps"], (device, value) => rangeMatch(value, device.session?.bitrate ?? -1, { "Under 2 Mbps": [0, 2000], "2–2.5 Mbps": [2000, 2501], "Over 2.5 Mbps": [2501, Infinity] })),
        field("fps", "Frame rate", ["Under 24 fps", "24 fps", "30 fps"], (device, value) => value === "Under 24 fps" ? (device.session?.fps ?? Infinity) < 24 : device.session?.fps === Number.parseInt(value)),
        field("resolution", "Resolution", ["1280 × 720", "1920 × 1080"], (device, value) => device.session?.resolution === value),
        field("mos", "MOS quality", ["Critical (< 3.5)", "Degraded (3.5–4.1)", "Good (4.2+)"], (device, value) => rangeMatch(value, device.session?.mos ?? -1, { "Critical (< 3.5)": [0, 3.5], "Degraded (3.5–4.1)": [3.5, 4.2], "Good (4.2+)": [4.2, Infinity] })),
        field("duration", "Session duration", ["Under 30 min", "30–60 min", "Over 60 min"], (device, value) => rangeMatch(value, Number.parseInt(device.session?.duration ?? "-1"), { "Under 30 min": [0, 30], "30–60 min": [30, 61], "Over 60 min": [61, Infinity] })),
      ],
    },
    {
      title: "Services & configuration",
      description: "CPaaS, codec, application version, and workstation settings",
      fields: [
        field("cpaas", "CPaaS vendor", cpaasVendors, (device, value) => peripheral(device, "CPaaS vendor")?.model === value),
        field("cpaas-health", "CPaaS health", healthOptions, (device, value) => peripheral(device, "CPaaS vendor")?.status === value),
        field("codec-config", "Codec configuration", ["H.264 video", "VP9 video"], (device, value) => peripheral(device, "Codec configuration")?.model === value),
        field("codec-health", "Codec config health", healthOptions, (device, value) => peripheral(device, "Codec configuration")?.status === value),
        field("isa-version", "ISA App version", Array.from({ length: 8 }, (_, index) => `3.${index + 2}.x`), (device, value) => peripheral(device, "ISA App")?.model.startsWith(`Version ${value.slice(0, -1)}`) ?? false),
        field("isa-health", "ISA App health", healthOptions, (device, value) => peripheral(device, "ISA App")?.status === value),
        field("dual-monitor", "Dual-monitor mouse support", ["Enabled", "Disabled"], (device, value) => device.configuration.dualMonitorMouseSupport === (value === "Enabled")),
      ],
    },
  ];
  const advancedFields = advancedCategories.flatMap((category) => category.fields);

  const filteredRooms = useMemo(() => devices
    .filter((device) => organizationFilter === "All" || device.organization === organizationFilter)
    .filter((device) => statusFilter === "All" || device.status === statusFilter)
    .filter((device) => sessionFilter === "All" || (sessionFilter === "Active" ? Boolean(device.session) : !device.session))
    .filter((device) => advancedFields.every((item) => item.value === "All" || item.matches(device, item.value)))
    .filter((device) => `${device.name} ${device.id} ${device.site} ${device.state} ${device.country} ${device.ip} ${device.peripherals.map((item) => `${item.name} ${item.model} ${item.connection}`).join(" ")}`.toLowerCase().includes(roomSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)), [organizationFilter, statusFilter, sessionFilter, roomSearch, advancedFilters]);

  const visibleOrganizations = organizationFilter === "All" ? organizations : [organizationFilter];
  const resetAdvancedFilters = () => {
    setOrganizationFilter("All");
    setStatusFilter("All");
    setSessionFilter("All");
    setAdvancedFilters({});
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-tight">Rooms</h1><span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">{filteredRooms.length} rooms</span></div><p className="mt-1 text-sm text-slate-500">All monitored rooms organized by customer and current live status.</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-400"><Icon name="clock" className="h-4 w-4" />Telemetry received 8 seconds ago</div>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={roomSearch} onChange={(event) => setRoomSearch(event.target.value)} placeholder="Search room, IP, device, or location" className="h-9 w-full min-w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white xl:w-72" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative"><span className="sr-only">Organization</span><select value={organizationFilter} onChange={(event) => setOrganizationFilter(event.target.value as "All" | Organization)} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"><option value="All">All organizations</option>{organizations.map((item) => <option key={item} value={item}>{item}</option>)}</select><Icon name="chevron" className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 rotate-90 text-slate-400" /></label>
            <label className="relative"><span className="sr-only">Health status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | Status)} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"><option value="All">All health states</option><option value="Healthy">Healthy</option><option value="Warning">Warning</option><option value="Critical">Critical</option></select><Icon name="chevron" className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 rotate-90 text-slate-400" /></label>
            <label className="relative"><span className="sr-only">Session status</span><select value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value as "All" | "Active" | "Available")} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"><option value="All">All session states</option><option value="Active">Active session</option><option value="Available">Available</option></select><Icon name="chevron" className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 rotate-90 text-slate-400" /></label>
            <button onClick={() => setShowAdvanced((shown) => !shown)} className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${showAdvanced ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}><Icon name="settings" className="h-4 w-4" />Advanced search{advancedFields.filter((field) => field.value !== "All").length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{advancedFields.filter((field) => field.value !== "All").length}</span>}<Icon name="chevron" className={`h-3.5 w-3.5 transition ${showAdvanced ? "-rotate-90" : "rotate-90"}`} /></button>
          </div>
        </div>
        {showAdvanced && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xs font-bold text-slate-700">Advanced room parameters</h3><p className="mt-0.5 text-[10px] text-slate-400">Combine network, hardware, session, configuration, and geography parameters.</p></div><button onClick={resetAdvancedFilters} className="self-start text-[10px] font-bold text-blue-600 hover:text-blue-700">Clear all filters</button></div>
            <div className="mt-4 space-y-3">
              {advancedCategories.map((category) => (
                <section key={category.title} className="rounded-xl border border-slate-200 bg-slate-50/30 p-3.5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div><h4 className="text-[11px] font-bold text-slate-700">{category.title}</h4><p className="mt-0.5 text-[9px] text-slate-400">{category.description}</p></div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-400 ring-1 ring-slate-200">{category.fields.length} parameters</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.fields.map((parameter) => (
                      <div key={parameter.key} className="block">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className={`text-[9px] font-bold uppercase tracking-[0.08em] ${parameter.value !== "All" ? "text-blue-600" : "text-slate-400"}`}>{parameter.label}</span>
                          {parameter.value !== "All" && <button onClick={() => parameter.setValue("All")} className="grid h-4 w-4 place-items-center rounded-full bg-blue-50 text-blue-500 transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${parameter.label} filter`} title={`Clear ${parameter.label}`}><Icon name="close" className="h-2.5 w-2.5" /></button>}
                        </div>
                        <span className="relative block"><select value={parameter.value} onChange={(event) => parameter.setValue(event.target.value)} aria-label={parameter.label} className={`h-10 w-full appearance-none rounded-lg border pl-3 pr-8 text-xs font-semibold outline-none transition focus:border-blue-500 ${parameter.value !== "All" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>{parameter.options.map((option) => <option key={option} value={option}>{option === "All" ? `All ${parameter.label.toLowerCase()} values` : option}</option>)}</select><Icon name="chevron" className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 rotate-90 text-slate-400" /></span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"><span className="text-[10px] text-slate-500"><strong className="text-slate-700">{filteredRooms.length}</strong> rooms match the selected criteria</span>{advancedFields.some((field) => field.value !== "All") && <span className="text-[9px] font-semibold text-blue-600">{advancedFields.filter((field) => field.value !== "All").length} advanced filters active</span>}</div>
          </div>
        )}
      </section>

      <div className="mt-4 space-y-4">
        {visibleOrganizations.map((organizationName) => {
          const organizationRooms = filteredRooms.filter((device) => device.organization === organizationName);
          if (!organizationRooms.length) return null;
          return (
            <section key={organizationName} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">{organizationName}</h2><p className="mt-0.5 text-[10px] text-slate-400">{organizationRooms.length} matching rooms</p></div><div className="flex items-center gap-3 text-[10px]"><span className="text-emerald-600">{organizationRooms.filter((room) => room.status === "Healthy").length} healthy</span><span className="text-amber-600">{organizationRooms.filter((room) => room.status === "Warning").length} warning</span><span className="text-red-600">{organizationRooms.filter((room) => room.status === "Critical").length} critical</span></div></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400"><th className="px-5 py-3">Room</th><th className="px-4 py-3">Health</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">Latency</th><th className="px-4 py-3">Peripheral health & configurations</th><th className="px-5 py-3" /></tr></thead>
                  <tbody>{organizationRooms.map((room) => (
                    <tr key={room.id} onClick={() => onSelectRoom(room.id)} className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-blue-50/30">
                      <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name="monitor" className="h-4 w-4" /></div><div><p className="text-xs font-bold text-slate-700">{room.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{room.id} · {room.ip}</p></div></div></td>
                      <td className="px-4 py-3"><StatusPill status={room.status} /></td>
                      <td className="px-4 py-3"><p className="text-[11px] font-semibold text-slate-600">{room.site}</p><p className="mt-0.5 text-[9px] text-slate-400">{room.state}, {room.country}</p></td>
                      <td className="px-4 py-3">{room.session ? <span className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-600"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Active · {room.session.duration}</span> : <span className="text-[10px] text-slate-400">Available</span>}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${room.latency > 70 ? "text-red-600" : "text-slate-600"}`}>{room.latency} ms</td>
                      <td className="px-4 py-3 text-[10px] font-semibold text-slate-500">{room.peripherals.filter((item) => item.status === "Healthy").length}/{room.peripherals.length} healthy</td>
                      <td className="px-5 py-3"><Icon name="chevron" className="h-4 w-4 text-slate-300" /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          );
        })}
        {!filteredRooms.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><Icon name="search" className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No rooms match these filters</p></div>}
      </div>
    </>
  );
}

function ActiveSessionsView({ onSelectRoom }: { onSelectRoom: (roomId: string) => void }) {
  const [organizationFilter, setOrganizationFilter] = useState<"All" | Organization>("All");
  const [qualityFilter, setQualityFilter] = useState<"All" | "Good" | "Degraded" | "Critical">("All");
  const [sessionSearch, setSessionSearch] = useState("");
  const sessionQuality = (device: Device) => device.status === "Critical" || (device.session?.mos ?? 5) < 3.5 ? "Critical" : device.status === "Warning" || (device.session?.mos ?? 5) < 4.2 ? "Degraded" : "Good";
  const sessions = useMemo(() => devices
    .filter((device) => device.session)
    .filter((device) => organizationFilter === "All" || device.organization === organizationFilter)
    .filter((device) => qualityFilter === "All" || sessionQuality(device) === qualityFilter)
    .filter((device) => `${device.name} ${device.site} ${device.session?.remoteTechnologist.name} ${device.session?.inSuiteAssistant.name}`.toLowerCase().includes(sessionSearch.toLowerCase()))
    .sort((a, b) => (a.session?.mos ?? 5) - (b.session?.mos ?? 5) || a.name.localeCompare(b.name)), [organizationFilter, qualityFilter, sessionSearch]);
  const allActive = devices.filter((device) => device.session && (organizationFilter === "All" || device.organization === organizationFilter));
  const averageMos = allActive.length ? (allActive.reduce((sum, device) => sum + (device.session?.mos ?? 0), 0) / allActive.length).toFixed(1) : "—";

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-tight">Active Sessions - WebRTC Health</h1><span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />LIVE</span></div><p className="mt-1 text-sm text-slate-500">Real-time session quality, connected users, and media performance.</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-400"><Icon name="clock" className="h-4 w-4" />Telemetry received 8 seconds ago</div>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active sessions", allActive.length, "Connected now", "text-blue-600"],
          ["Average MOS", averageMos, "Fleet session quality", "text-emerald-600"],
          ["Degraded", allActive.filter((device) => sessionQuality(device) === "Degraded").length, "Needs monitoring", "text-amber-600"],
          ["Critical", allActive.filter((device) => sessionQuality(device) === "Critical").length, "Needs attention", "text-red-600"],
        ].map(([label, value, detail, color]) => <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"><p className="text-xs font-semibold text-slate-500">{label as string}</p><p className={`mt-2 text-3xl font-bold tracking-tight ${color as string}`}>{value as React.ReactNode}</p><p className="mt-1 text-[10px] text-slate-400">{detail as string}</p></div>)}
      </section>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative"><Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={sessionSearch} onChange={(event) => setSessionSearch(event.target.value)} placeholder="Search room or connected user" className="h-9 w-full min-w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white xl:w-72" /></div>
          <div className="flex flex-wrap gap-2">
            <label className="relative"><span className="sr-only">Organization</span><select value={organizationFilter} onChange={(event) => setOrganizationFilter(event.target.value as "All" | Organization)} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"><option value="All">All organizations</option>{organizations.map((item) => <option key={item} value={item}>{item}</option>)}</select><Icon name="chevron" className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 rotate-90 text-slate-400" /></label>
            <label className="relative"><span className="sr-only">Session quality</span><select value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value as "All" | "Good" | "Degraded" | "Critical")} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"><option value="All">All quality levels</option><option value="Good">Good</option><option value="Degraded">Degraded</option><option value="Critical">Critical</option></select><Icon name="chevron" className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 rotate-90 text-slate-400" /></label>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-800">Session health map</h2><p className="mt-1 text-xs text-slate-400">Select any active room to inspect its live session</p></div><div className="flex gap-3 text-[10px] text-slate-500"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-500" />Good</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400" />Degraded</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500" />Critical</span></div></div>
        <div className="fleet-grid mt-5">{sessions.slice().sort((a, b) => a.name.localeCompare(b.name)).map((device) => <button key={`full-session-${device.id}`} onClick={() => onSelectRoom(device.id)} title={`${device.name} · ${device.session?.mos} MOS`} className={`aspect-square min-h-[5px] rounded-[2px] transition hover:scale-150 hover:ring-2 hover:ring-white ${sessionQuality(device) === "Critical" ? "bg-red-500" : sessionQuality(device) === "Degraded" ? "bg-amber-400" : "bg-blue-500"}`} aria-label={`Open ${device.name} session glance`} />)}</div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Live sessions</h2><p className="mt-1 text-xs text-slate-400">{sessions.length} matching sessions · lowest quality first</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400"><th className="px-5 py-3">Room</th><th className="px-4 py-3">Quality</th><th className="px-4 py-3">Remote Technologist</th><th className="px-4 py-3">In-Suite Assistant</th><th className="px-4 py-3">MOS</th><th className="px-4 py-3">Bitrate</th><th className="px-4 py-3">Packet loss</th><th className="px-5 py-3" /></tr></thead><tbody>{sessions.map((device) => <tr key={`session-row-${device.id}`} onClick={() => onSelectRoom(device.id)} className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-blue-50/30"><td className="px-5 py-3"><p className="text-xs font-bold text-slate-700">{device.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{device.site} · {device.organization}</p></td><td className="px-4 py-3"><span className={`text-[10px] font-bold ${sessionQuality(device) === "Critical" ? "text-red-600" : sessionQuality(device) === "Degraded" ? "text-amber-600" : "text-emerald-600"}`}>{sessionQuality(device)}</span></td><td className="px-4 py-3 text-[11px] font-semibold text-slate-600">{device.session?.remoteTechnologist.name}</td><td className="px-4 py-3 text-[11px] font-semibold text-slate-600">{device.session?.inSuiteAssistant.name}</td><td className="px-4 py-3 text-xs font-bold text-slate-700">{device.session?.mos}</td><td className="px-4 py-3 text-[11px] text-slate-600">{device.session?.bitrate} kbps</td><td className="px-4 py-3 text-[11px] text-slate-600">{device.packetLoss}%</td><td className="px-5 py-3"><Icon name="chevron" className="h-4 w-4 text-slate-300" /></td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<"overview" | "users" | "rooms" | "sessions" | "device">("overview");
  const [deviceReturnView, setDeviceReturnView] = useState<"overview" | "rooms" | "sessions">("overview");
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [mapCountry, setMapCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [worldBoundaryData, setWorldBoundaryData] = useState<typeof import("./worldPaths") | null>(null);
  const [boundaryData, setBoundaryData] = useState<typeof import("./statePaths") | null>(null);
  // Keep the region-era binding name so Fast Refresh can safely migrate open map panels.
  const [selectedRegion, setSelectedRegion] = useState<Country | null>(null);
  const [organization, setOrganization] = useState<"All" | Organization>("All");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roomPanelMode, setRoomPanelMode] = useState<"glance" | "detailed">("glance");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!worldBoundaryData) {
      import("./worldPaths").then(setWorldBoundaryData);
    }
    if (mapRegion && !boundaryData) {
      import("./statePaths").then(setBoundaryData);
    }
  }, [mapRegion, boundaryData, worldBoundaryData]);

  const fleetDevices = useMemo(() => organization === "All" ? devices : devices.filter((device) => device.organization === organization), [organization]);
  const alphabetizedFleetDevices = useMemo(() => [...fleetDevices].sort((a, b) => a.name.localeCompare(b.name)), [fleetDevices]);
  const counts = useMemo(() => ({
    Healthy: fleetDevices.filter((d) => d.status === "Healthy").length,
    Warning: fleetDevices.filter((d) => d.status === "Warning").length,
    Critical: fleetDevices.filter((d) => d.status === "Critical").length,
  }), [fleetDevices]);
  const activeSessions = useMemo(() => fleetDevices.filter((device) => device.session), [fleetDevices]);
  const selected = selectedId ? devices.find((device) => device.id === selectedId) ?? null : null;
  const selectedIsaApp = selected ? isaAppDetails(selected.peripherals) : undefined;
  const selectedCpaasVendor = selected?.peripherals.find((item) => item.name === "CPaaS vendor");
  const selectedCodecConfiguration = selected?.peripherals.find((item) => item.name === "Codec configuration");
  const countrySummaries = useMemo(() => countryMapPoints.map(({ country }) => {
    const rooms = fleetDevices.filter((device) => device.country === country);
    return {
      country,
      rooms,
      healthy: rooms.filter((device) => device.status === "Healthy").length,
      warning: rooms.filter((device) => device.status === "Warning").length,
      critical: rooms.filter((device) => device.status === "Critical").length,
    };
  }), [fleetDevices]);
  const countryRooms = selectedRegion
    ? [...fleetDevices.filter((device) => device.country === selectedRegion && (!selectedState || device.state === selectedState))].sort((a, b) => {
      const severity = { Critical: 0, Warning: 1, Healthy: 2 };
      return severity[a.status] - severity[b.status] || b.latency - a.latency;
    })
    : [];
  const selectedCountrySummary = countrySummaries.find((item) => item.country === selectedRegion);
  const mapRegionRooms = mapRegion ? fleetDevices.filter((device) => device.region === mapRegion) : fleetDevices;
  const mapRegionSummary = {
    healthy: mapRegionRooms.filter((device) => device.status === "Healthy").length,
    warning: mapRegionRooms.filter((device) => device.status === "Warning").length,
    critical: mapRegionRooms.filter((device) => device.status === "Critical").length,
  };
  const mapCountryRooms = mapCountry ? fleetDevices.filter((device) => device.country === mapCountry) : [];
  const mapCountrySummary = {
    healthy: mapCountryRooms.filter((device) => device.status === "Healthy").length,
    warning: mapCountryRooms.filter((device) => device.status === "Warning").length,
    critical: mapCountryRooms.filter((device) => device.status === "Critical").length,
  };
  const visibleCountryPoints = mapRegion
    ? countryMapPoints.filter((point) => fleetDevices.some((device) => device.country === point.country && device.region === mapRegion))
    : countryMapPoints;
  const selectedScopeSummary = {
    healthy: countryRooms.filter((device) => device.status === "Healthy").length,
    warning: countryRooms.filter((device) => device.status === "Warning").length,
    critical: countryRooms.filter((device) => device.status === "Critical").length,
  };
  const stateColor = (country: Country, state: string) => {
    const rooms = fleetDevices.filter((device) => device.country === country && device.state === state);
    if (!rooms.length) return "fill-slate-200 hover:fill-slate-300";
    if (rooms.some((device) => device.status === "Critical")) return "fill-red-500 hover:fill-red-400";
    if (rooms.some((device) => device.status === "Warning")) return "fill-amber-500 hover:fill-amber-400";
    return "fill-emerald-500 hover:fill-emerald-400";
  };
  const countryColor = (country: Country) => {
    const summary = countrySummaries.find((item) => item.country === country);
    const healthyRate = summary?.rooms.length ? summary.healthy / summary.rooms.length : 0;
    return healthyRate >= 0.8
      ? "fill-emerald-500 stroke-emerald-200"
      : healthyRate >= 0.7
        ? "fill-amber-500 stroke-amber-200"
        : "fill-red-500 stroke-red-200";
  };
  const continentColor = (region: Region) => {
    const rooms = fleetDevices.filter((device) => device.region === region);
    const healthyRate = rooms.length ? rooms.filter((device) => device.status === "Healthy").length / rooms.length : 0;
    return healthyRate >= 0.8
      ? "fill-emerald-500 hover:fill-emerald-400"
      : healthyRate >= 0.7
        ? "fill-amber-500 hover:fill-amber-400"
        : "fill-red-500 hover:fill-red-400";
  };

  const filtered = useMemo(() => fleetDevices.filter((device) => {
    const matchesFilter = filter === "All" || device.status === filter;
    const term = search.toLowerCase();
    const matchesSearch = !term || `${device.name} ${device.id} ${device.site}`.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  }), [fleetDevices, filter, search]);

  const queue = filtered
    .filter((device) => showAll || device.status !== "Healthy")
    .sort((a, b) => (a.status === "Critical" ? -1 : b.status === "Critical" ? 1 : b.latency - a.latency))
    .slice(0, showAll ? 24 : 8);
  const openRoomGlance = (roomId: string) => {
    setView("overview");
    setRoomPanelMode("glance");
    setSelectedId(roomId);
  };

  return (
    <div className={`${darkMode ? "dark" : ""} app-shell min-h-screen overflow-x-hidden bg-[#f6f7f9] text-slate-900`}>
      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-full items-center">
          <div className="flex h-full w-auto shrink-0 items-center px-3 md:w-72 md:border-r md:border-slate-200 md:px-5">
            <div className="mr-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-600/20 ring-1 ring-white/20 md:mr-3">
              <Icon name="command" className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">TechLive</div>
              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400 lg:block">Operational Command Center</div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end px-2 sm:justify-between sm:px-4 md:px-7">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">{view === "users" ? "Users" : view === "rooms" ? "Rooms" : view === "sessions" ? "Active Sessions" : view === "device" ? "Room details" : "TechLive Fleet Health"}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span>
                Live monitoring
              </div>
              <button onClick={() => setDarkMode((enabled) => !enabled)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"}>
                <Icon name={darkMode ? "sun" : "moon"} />
              </button>
              <button className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications">
                <Icon name="bell" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
              </button>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="hidden h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white sm:grid">AM</div>
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-72 flex-col border-r border-slate-200 bg-white p-3 md:flex">
        <div className="mb-2 px-3 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Monitor</div>
        <nav className="space-y-1">
          {[
            ["grid", "Fleet overview", "overview"],
            ["user", "Users", "users"],
            ["monitor", "Rooms", "rooms"],
            ["alert", "Incidents", ""],
            ["network", "Active sessions", "sessions"],
            ["video", "Peripherals & config", ""],
          ].map(([icon, label, target]) => {
            const active = target === view || (label === "Rooms" && view === "device");
            return (
              <button key={label} onClick={() => target && setView(target as "overview" | "users" | "rooms" | "sessions")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10" : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"}`}>
                <Icon name={icon as "grid"} className="h-[18px] w-[18px]" />
                {label}
                {label === "Incidents" && <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">{counts.Critical}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between px-3.5 pt-3.5">
              <div><p className="text-xs font-bold text-slate-700">{mapCountry ? `${mapCountry} health` : mapRegion ? `${mapRegion} health` : "Global health"}</p><p className="mt-0.5 text-[9px] text-slate-400">{mapCountry ? "Select a state for room details" : mapRegion ? "Select a country to zoom in" : "Select a region to zoom in"}</p></div>
              {mapRegion ? <button onClick={() => { if (mapCountry) setMapCountry(null); else setMapRegion(null); }} className="grid h-7 w-7 place-items-center rounded-md bg-white text-blue-600 ring-1 ring-slate-200 transition hover:bg-slate-50" aria-label={mapCountry ? `Back to ${mapRegion}` : "Back to world map"} title="Back up one level"><Icon name="chevron" className="h-4 w-4 rotate-180" /></button> : <span className="flex h-2 w-2 rounded-full bg-emerald-500" />}
            </div>
            <svg viewBox={mapCountry && boundaryData ? (mapCountry === "United States" ? "33 24 43 22" : boundaryData.countryViewBoxes[mapCountry]) : mapRegion === "Americas" ? "0 0 105 120" : mapRegion === "EMEA" ? "92 15 75 100" : mapRegion === "APAC" ? "130 8 105 105" : "0 0 235 120"} className={`mt-1 w-full px-2 transition-all duration-300 ${mapCountry === "United States" ? "h-56" : "h-44"}`} role="img" aria-label={mapCountry ? `${mapCountry} state health map` : mapRegion ? `${mapRegion} country health map` : "World map showing regional health"}>
              {!mapCountry && <g onClick={() => { setMapRegion("Americas"); setMapCountry(null); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { setMapRegion("Americas"); setMapCountry(null); } }} tabIndex={0} role="button" aria-label="Zoom into the Americas" className={`cursor-pointer stroke-white/80 stroke-[0.35] outline-none transition ${continentColor("Americas")}`}>
                <path d={worldBoundaryData?.worldRegionPaths.Americas ?? ""} fillRule="evenodd" />
                <title>Americas</title>
              </g>}
              {!mapCountry && <g onClick={() => { setMapRegion("EMEA"); setMapCountry(null); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { setMapRegion("EMEA"); setMapCountry(null); } }} tabIndex={0} role="button" aria-label="Zoom into EMEA" className={`cursor-pointer stroke-white/80 stroke-[0.35] outline-none transition ${continentColor("EMEA")}`}>
                <path d={worldBoundaryData?.worldRegionPaths.EMEA ?? ""} fillRule="evenodd" />
                <title>EMEA</title>
              </g>}
              {!mapCountry && <g onClick={() => { setMapRegion("APAC"); setMapCountry(null); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { setMapRegion("APAC"); setMapCountry(null); } }} tabIndex={0} role="button" aria-label="Zoom into APAC" className={`cursor-pointer stroke-white/80 stroke-[0.35] outline-none transition ${continentColor("APAC")}`}>
                <path d={worldBoundaryData?.worldRegionPaths.APAC ?? ""} fillRule="evenodd" />
                <title>APAC</title>
              </g>}
              {mapRegion && !mapCountry && boundaryData && visibleCountryPoints.map((point) => (
                <g key={point.country} onClick={(event) => { event.stopPropagation(); setMapCountry(point.country); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.stopPropagation(); setMapCountry(point.country); } }} tabIndex={0} role="button" aria-label={`Zoom into ${point.country}`} className={`cursor-pointer stroke-white stroke-[0.3] outline-none transition ${countryColor(point.country)}`}>
                  {boundaryData.countryStatePaths[point.country].map((state, stateIndex) => <path key={`${state.name}-${stateIndex}`} d={state.d} fillRule="evenodd" />)}
                  <text x={point.x} y={point.y - 4} textAnchor="middle" className="pointer-events-none fill-slate-700 text-[4.5px] font-bold">{point.country}</text>
                  <title>{point.country}</title>
                </g>
              ))}
              {mapCountry && boundaryData && boundaryData.countryStatePaths[mapCountry].map((state, stateIndex) => (
                <path
                  key={`${state.name}-${stateIndex}`}
                  d={state.d}
                  fillRule="evenodd"
                  onClick={() => { setSelectedState(state.name); setSelectedRegion(mapCountry); }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${state.name} health`}
                  className={`cursor-pointer stroke-white stroke-[0.18] outline-none transition ${stateColor(mapCountry, state.name)}`}
                >
                  <title>{state.name}</title>
                </path>
              ))}
            </svg>
            {mapCountry ? (
              <div className="grid grid-cols-3 border-t border-slate-200 bg-white">
                <div className="px-1 py-2 text-center"><p className="text-[8px] text-slate-400">Healthy</p><p className="mt-0.5 text-[10px] font-bold text-emerald-600">{mapCountrySummary.healthy}</p></div>
                <div className="border-x border-slate-100 px-1 py-2 text-center"><p className="text-[8px] text-slate-400">Warning</p><p className="mt-0.5 text-[10px] font-bold text-amber-600">{mapCountrySummary.warning}</p></div>
                <div className="px-1 py-2 text-center"><p className="text-[8px] text-slate-400">Critical</p><p className="mt-0.5 text-[10px] font-bold text-red-600">{mapCountrySummary.critical}</p></div>
              </div>
            ) : mapRegion ? (
              <div className="grid grid-cols-3 border-t border-slate-200 bg-white">
                <div className="px-1 py-2 text-center"><p className="text-[8px] text-slate-400">Healthy</p><p className="mt-0.5 text-[10px] font-bold text-emerald-600">{mapRegionSummary.healthy}</p></div>
                <div className="border-x border-slate-100 px-1 py-2 text-center"><p className="text-[8px] text-slate-400">Warning</p><p className="mt-0.5 text-[10px] font-bold text-amber-600">{mapRegionSummary.warning}</p></div>
                <div className="px-1 py-2 text-center"><p className="text-[8px] text-slate-400">Critical</p><p className="mt-0.5 text-[10px] font-bold text-red-600">{mapRegionSummary.critical}</p></div>
              </div>
            ) : (
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2">
                <span className="text-[9px] font-semibold text-slate-500">3 regions · 10 countries</span>
                <span className="flex items-center gap-2 text-[8px] text-slate-400"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Healthy</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Attention</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Critical</span></span>
              </div>
            )}
          </div>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
            <Icon name="settings" className="h-[18px] w-[18px]" />Settings
          </button>
        </div>
      </aside>

      <nav className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pt-2 backdrop-blur md:hidden" aria-label="Primary navigation">
        {[
          ["grid", "Fleet", "overview"],
          ["monitor", "Rooms", "rooms"],
          ["network", "Sessions", "sessions"],
          ["user", "Users", "users"],
        ].map(([icon, label, target]) => {
          const active = view === target || (view === "device" && target === "rooms");
          return <button key={label} onClick={() => { setSelectedId(null); setView(target as "overview" | "rooms" | "sessions" | "users"); }} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-400"}`}><Icon name={icon as "grid"} className="h-5 w-5" /><span className="truncate">{label}</span></button>;
        })}
      </nav>

      <main className="pb-24 pt-16 md:pb-0 md:pl-72">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {view === "users" ? (
            <UsersView onSelectRoom={setSelectedId} />
          ) : view === "rooms" ? (
            <RoomsView onSelectRoom={(roomId) => { setRoomPanelMode("glance"); setSelectedId(roomId); }} />
          ) : view === "sessions" ? (
            <ActiveSessionsView onSelectRoom={(roomId) => { setRoomPanelMode("glance"); setSelectedId(roomId); }} />
          ) : view === "device" && selected ? (
            <DevicePage device={selected} onBack={() => { setRoomPanelMode("glance"); setView(deviceReturnView); }} />
          ) : (
          <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">TechLive Fleet Health</h1>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">{fleetDevices.length} rooms</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Real-time health and network performance across all rooms.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Icon name="clock" className="h-4 w-4" /> Telemetry received 8 seconds ago
              <span className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 shadow-sm">Real-time only</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 px-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="grid" className="h-4 w-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Organization</p><p className="text-xs font-semibold text-slate-700">{organization === "All" ? "All organizations" : organization}</p></div></div>
            <div className="relative min-w-52">
              <select value={organization} onChange={(event) => setOrganization(event.target.value as "All" | Organization)} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" aria-label="Filter fleet by organization">
                <option value="All">All organizations</option>
                <option value="Radnet">Radnet</option>
                <option value="Akumin">Akumin</option>
                <option value="NorthwestStaffing">NorthwestStaffing</option>
              </select>
              <Icon name="chevron" className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
            </div>
          </div>

          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button className="group rounded-xl border border-amber-200 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600"><Icon name="bell" className="h-4 w-4" /></span><p className="text-sm font-medium text-slate-600">Service notifications</p></div>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">2 ACTIVE</span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">CPaaS vendor advisory</p><p className="mt-1 truncate text-[11px] text-amber-600">Elevated call setup latency</p></div>
                <Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </div>
            </button>
            {(["Healthy", "Warning", "Critical"] as Status[]).map((status) => (
              <button key={status} onClick={() => setFilter(status)} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${statusStyles[status].dot}`} /><span className="text-sm font-medium text-slate-500">{status} systems</span></div>
                  <Icon name="arrow" className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                </div>
                <div className="mt-3 flex items-end justify-between"><span className="text-3xl font-bold tracking-tight">{counts[status]}</span><span className="text-xs font-medium text-slate-400">{Math.round((counts[status] / fleetDevices.length) * 100)}% of fleet</span></div>
              </button>
            ))}
          </section>

          <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-sm font-bold text-slate-800">Live service topology</h2><p className="mt-1 text-xs text-slate-400">Follow the service path from provider to active room sessions</p></div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Operational</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Advisory</span><span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">Real-time</span></div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                ["CPaaS provider", "Vendor advisory", "2 active notices", "network", "Warning"],
                ["Regional edge", "3 of 3 online", "24 ms median RTT", "network", "Healthy"],
                ["Room fleet", `${fleetDevices.length} reporting`, `${counts.Critical} need attention`, "monitor", counts.Critical > 0 ? "Warning" : "Healthy"],
                ["Active sessions", `${activeSessions.length} connected`, "4.3 average MOS", "user", "Healthy"],
              ].map(([label, value, detail, icon, state], index) => (
                <div key={label as string} className="relative flex items-center">
                  <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${state === "Warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Icon name={icon as "network"} className="h-[18px] w-[18px]" /></div>
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-slate-400">{label as string}</p><p className="mt-0.5 truncate text-xs font-bold text-slate-700">{value as string}</p><p className={`mt-0.5 truncate text-[9px] ${state === "Warning" ? "text-amber-600" : "text-slate-400"}`}>{detail as string}</p></div>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${state === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  </div>
                  {index < 3 && <div className="absolute -right-3 z-10 hidden h-px w-3 bg-slate-300 md:block"><span className="absolute -right-0.5 -top-[2px] h-1.5 w-1.5 rotate-45 border-r border-t border-slate-300" /></div>}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-start justify-between">
                <div><h2 className="text-sm font-bold text-slate-800">Fleet Health Map</h2><p className="mt-1 text-xs text-slate-400">Each cell represents one room · select a cell to inspect</p></div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  {(["Healthy", "Warning", "Critical"] as Status[]).map((status) => <span key={status} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-sm ${statusStyles[status].dot}`} />{status}</span>)}
                </div>
              </div>
              <div className="fleet-grid mt-5">
                {alphabetizedFleetDevices.map((device) => (
                  <button key={device.id} title={`${device.id} · ${device.status}`} onClick={() => openRoomGlance(device.id)} className={`aspect-square min-h-[5px] rounded-[2px] transition hover:scale-150 hover:ring-2 hover:ring-white ${statusStyles[device.status].cell}`} aria-label={`Open room health glance for ${device.name}, ${device.status}`} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-400">Grouped by site · 10 operating locations</span>
                <button onClick={() => { setFilter("Critical"); document.getElementById("systems")?.scrollIntoView({ behavior: "smooth" }); }} className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950">View systems needing attention <Icon name="arrow" className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-slate-800">Live network performance</h2><p className="mt-1 text-xs text-slate-400">Current fleet median</p></div><span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />LIVE</span></div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[["Latency", "24", "ms"], ["Jitter", "6.8", "ms"], ["Packet loss", "0.2", "%"]].map(([label, value, unit]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-lg font-bold">{value}<span className="ml-0.5 text-[10px] font-medium text-slate-400">{unit}</span></p></div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Within target", counts.Healthy, "bg-emerald-500"],
                  ["Elevated", counts.Warning, "bg-amber-400"],
                  ["Critical", counts.Critical, "bg-red-500"],
                ].map(([label, count, color]) => (
                  <div key={label as string}>
                    <div className="mb-1.5 flex items-center justify-between text-[10px]"><span className="font-medium text-slate-500">{label as string}</span><span className="font-bold text-slate-700">{count as number} rooms</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color as string}`} style={{ width: `${Math.max(4, ((count as number) / fleetDevices.length) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">Active Sessions - WebRTC Health Map</h2>
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />LIVE</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Room occupancy and real-time WebRTC session quality</p>
              </div>
              <div className="flex items-baseline gap-2"><span className="text-2xl font-bold tracking-tight text-slate-900">{activeSessions.length}</span><span className="text-xs font-medium text-slate-400">of {fleetDevices.length} rooms active</span></div>
            </div>
            <div className="grid xl:grid-cols-[1.45fr_1fr]">
              <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-600">All rooms</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500" />Good session</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-400" />Degraded</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-slate-200" />Available</span>
                  </div>
                </div>
                <div className="fleet-grid mt-5">
                  {fleetDevices.map((device) => (
                    <button
                      key={`session-${device.id}`}
                      title={device.session ? `${device.name} · ${device.session.remoteTechnologist.name} + ${device.session.inSuiteAssistant.name} · MOS ${device.session.mos}` : `${device.name} · No active session`}
                      onClick={() => openRoomGlance(device.id)}
                      className={`aspect-square min-h-[5px] rounded-[2px] transition hover:scale-150 hover:ring-2 hover:ring-white ${
                        !device.session ? "bg-slate-200 hover:bg-slate-300" : device.status === "Healthy" ? "bg-blue-500 hover:bg-blue-600" : device.status === "Warning" ? "bg-amber-400 hover:bg-amber-500" : "bg-red-500 hover:bg-red-600"
                      }`}
                      aria-label={device.session ? `${device.name}, active session with ${device.session.remoteTechnologist.name} and ${device.session.inSuiteAssistant.name}` : `${device.name}, available`}
                    />
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Occupancy</p><p className="mt-1 text-lg font-bold">{Math.round((activeSessions.length / fleetDevices.length) * 100)}%</p></div>
                  <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Avg. MOS</p><p className="mt-1 text-lg font-bold">4.3<span className="ml-1 text-[10px] font-medium text-emerald-600">Good</span></p></div>
                  <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Degraded</p><p className="mt-1 text-lg font-bold text-amber-600">{activeSessions.filter((device) => device.status !== "Healthy").length}</p></div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-600">Sessions to watch</p><span className="text-[10px] text-slate-400">Lowest quality first</span></div>
                <div className="mt-3 divide-y divide-slate-100">
                  {activeSessions
                    .slice()
                    .sort((a, b) => (a.session?.mos ?? 5) - (b.session?.mos ?? 5))
                    .slice(0, 5)
                    .map((device) => (
                      <button key={`active-${device.id}`} onClick={() => openRoomGlance(device.id)} className="group flex w-full items-center gap-3 py-3 text-left">
                        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">
                          {device.session?.remoteTechnologist.name.split(" ").map((part) => part[0]).join("")}
                          <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${device.status === "Critical" ? "bg-red-500" : device.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-700">{device.name} · {device.site}</p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">RT: {device.session?.remoteTechnologist.name} · ISA: {device.session?.inSuiteAssistant.name}</p>
                        </div>
                        <div className="text-right"><p className={`text-xs font-bold ${(device.session?.mos ?? 5) < 3.5 ? "text-red-600" : "text-amber-600"}`}>{device.session?.mos} MOS</p><p className="mt-0.5 text-[10px] text-slate-400">{device.session?.duration}</p></div>
                        <Icon name="chevron" className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
                      </button>
                    ))}
                </div>
                <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[10px] leading-relaxed text-blue-700">Select any occupied room to inspect both session users, the connection path, and live WebRTC analytics.</p>
              </div>
            </div>
          </section>

          <section id="systems" className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div><h2 className="text-sm font-bold text-slate-800">Systems requiring attention</h2><p className="mt-1 text-xs text-slate-400">Prioritized by current severity</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search system or site" className="h-9 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white" />
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {(["All", "Critical", "Warning", "Healthy"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${filter === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item}</button>)}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  <th className="px-5 py-3">System</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Site</th><th className="px-4 py-3">Latency</th><th className="px-4 py-3">Jitter</th><th className="px-4 py-3">Packet loss</th><th className="px-4 py-3">Last seen</th><th className="px-5 py-3" />
                </tr></thead>
                <tbody>
                  {queue.map((device) => (
                    <tr key={device.id} onClick={() => setSelectedId(device.id)} className="cursor-pointer border-b border-slate-100 text-sm transition last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name="monitor" className="h-4 w-4" /></div><div><p className="text-xs font-bold text-slate-800">{device.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{device.id} · {device.ip}</p></div></div></td>
                      <td className="px-4 py-3.5"><StatusPill status={device.status} /></td>
                      <td className="px-4 py-3.5"><p className="text-xs font-medium text-slate-700">{device.site}</p><p className="text-[10px] text-slate-400">{device.region} region</p></td>
                      <td className={`px-4 py-3.5 text-xs font-semibold ${device.latency > 70 ? "text-red-600" : "text-slate-700"}`}>{device.latency} ms</td>
                      <td className={`px-4 py-3.5 text-xs font-semibold ${device.jitter > 30 ? "text-red-600" : "text-slate-700"}`}>{device.jitter} ms</td>
                      <td className={`px-4 py-3.5 text-xs font-semibold ${device.packetLoss > 2 ? "text-red-600" : "text-slate-700"}`}>{device.packetLoss}%</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{device.lastSeen}</td>
                      <td className="px-5 py-3.5"><Icon name="chevron" className="h-4 w-4 text-slate-300" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {queue.length === 0 && <div className="p-10 text-center text-sm text-slate-400">No systems match your current filters.</div>}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-[11px] text-slate-400">Showing {queue.length} of {filtered.length} matching systems</p>
              <button onClick={() => setShowAll(!showAll)} className="text-xs font-semibold text-slate-600 hover:text-slate-950">{showAll ? "Show priority only" : "View all matching systems"}</button>
            </div>
          </section>
          </>
          )}
        </div>
      </main>

      {selectedRegion && selectedCountrySummary && (
        <>
          <button onClick={() => { setSelectedRegion(null); setSelectedState(null); }} className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" aria-label="Close state panel" />
          <aside className="detail-panel fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[620px] flex-col border-l border-slate-200 bg-[#f8fafb] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span>{selectedRegion}</span>{selectedState && <><Icon name="chevron" className="h-3 w-3" /><span className="text-slate-900">{selectedState}</span></>}</div>
              <button onClick={() => { setSelectedRegion(null); setSelectedState(null); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><Icon name="close" className="h-5 w-5" /></button>
            </div>
            <div className="border-b border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div><h2 className="text-xl font-bold tracking-tight">{selectedState ?? selectedRegion}</h2><p className="mt-1 text-xs text-slate-400">{countryRooms.length} rooms reporting live telemetry{selectedState ? ` · ${selectedRegion}` : ""}</p></div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />CONNECTED</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Healthy", selectedScopeSummary.healthy, "text-emerald-600", "bg-emerald-500"],
                  ["Warning", selectedScopeSummary.warning, "text-amber-600", "bg-amber-500"],
                  ["Critical", selectedScopeSummary.critical, "text-red-600", "bg-red-500"],
                ].map(([label, count, text, dot]) => (
                  <div key={label as string} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${dot as string}`} /><span className="text-[10px] font-medium text-slate-400">{label as string}</span></div>
                    <p className={`mt-2 text-2xl font-bold ${text as string}`}>{count as number}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3"><div><p className="text-xs font-bold text-slate-700">Rooms</p><p className="mt-0.5 text-[9px] text-slate-400">Rooms needing attention are shown first</p></div><span className="text-[10px] font-semibold text-slate-400">{countryRooms.length} total</span></div>
            <div className="flex-1 overflow-y-auto bg-white">
              {countryRooms.map((room) => (
                <button
                  key={`country-${room.id}`}
                  onClick={() => { setSelectedRegion(null); setSelectedState(null); setSelectedId(room.id); }}
                  className="group flex w-full items-center gap-3 border-b border-slate-100 px-6 py-3.5 text-left transition hover:bg-slate-50"
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${room.status === "Critical" ? "bg-red-50 text-red-600" : room.status === "Warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Icon name="monitor" className="h-[18px] w-[18px]" /></div>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-xs font-bold text-slate-700">{room.name}</p><StatusPill status={room.status} /></div><p className="mt-1 truncate text-[10px] text-slate-400">{room.site} · {room.ip}</p></div>
                  <div className="text-right"><p className={`text-xs font-bold ${room.latency > 70 ? "text-red-600" : "text-slate-600"}`}>{room.latency} ms</p><p className="mt-0.5 text-[9px] text-slate-400">{room.session ? "Active session" : "Available"}</p></div>
                  <Icon name="chevron" className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {selected && view !== "device" && (
        <>
          <button onClick={() => setSelectedId(null)} className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" aria-label="Close detail panel" />
          <aside className="detail-panel fixed bottom-0 right-0 top-0 z-50 w-full max-w-[520px] overflow-y-auto border-l border-slate-200 bg-[#f8fafb] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span>Rooms</span><Icon name="chevron" className="h-3 w-3" /><span className="text-slate-900">{selected.id}</span></div>
              <div className="flex items-center gap-2"><button onClick={() => { setDeviceReturnView(view === "rooms" ? "rooms" : view === "sessions" ? "sessions" : "overview"); setView("device"); }} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-50"><Icon name="expand" className="h-3.5 w-3.5" />Open full room page</button><button onClick={() => setSelectedId(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"><Icon name="close" className="h-5 w-5" /></button></div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-white"><Icon name="monitor" className="h-6 w-6" /></div><div><h2 className="text-xl font-bold tracking-tight">{selected.name}</h2><p className="mt-1 text-xs font-semibold text-slate-500">{selected.organization}</p><p className="mt-0.5 text-[10px] text-slate-400">{selected.site} · {selected.ip}</p></div></div>
                <StatusPill status={selected.status} />
              </div>

              {selected.status !== "Healthy" && <div className={`mt-6 rounded-xl border p-4 ${selected.status === "Critical" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex gap-3"><Icon name="alert" className={`mt-0.5 h-5 w-5 shrink-0 ${selected.status === "Critical" ? "text-red-600" : "text-amber-600"}`} /><div><p className={`text-sm font-bold ${selected.status === "Critical" ? "text-red-800" : "text-amber-800"}`}>{selected.status === "Critical" ? "Network performance degraded" : "Performance threshold exceeded"}</p><p className={`mt-1 text-xs leading-relaxed ${selected.status === "Critical" ? "text-red-600" : "text-amber-700"}`}>Current latency and jitter are above the configured threshold.</p></div></div>
              </div>}

              {roomPanelMode === "glance" && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="TechLive heartbeat" value={selected.status === "Critical" ? "Delayed" : "Online"} unit="" state={selected.status === "Critical" ? "Warning" : "Healthy"} detail="Room agent" />
                    <MetricCard label="Latency" value={String(selected.latency)} unit="ms" state={selected.latency > 70 ? "Critical" : selected.latency > 35 ? "Warning" : "Healthy"} detail="Live network round trip" />
                    <MetricCard label="Jitter" value={String(selected.jitter)} unit="ms" state={selected.jitter > 30 ? "Critical" : selected.jitter > 10 ? "Warning" : "Healthy"} detail="Current variance" />
                    <MetricCard label="Packet loss" value={String(selected.packetLoss)} unit="%" state={selected.packetLoss > 2 ? "Critical" : selected.packetLoss > 0.5 ? "Warning" : "Healthy"} detail="Current media path" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><h3 className="text-xs font-bold text-slate-700">Active session</h3>{selected.session ? <span className="text-[9px] font-bold text-blue-600">CONNECTED · {selected.session.duration}</span> : <span className="text-[9px] text-slate-400">AVAILABLE</span>}</div>
                    {selected.session ? <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">Remote Technologist</p><p className="mt-1 truncate text-xs font-semibold text-slate-700">{selected.session.remoteTechnologist.name}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-[9px] uppercase tracking-wide text-slate-400">In-Suite Assistant</p><p className="mt-1 truncate text-xs font-semibold text-slate-700">{selected.session.inSuiteAssistant.name}</p></div></div> : <p className="mt-3 text-xs text-slate-400">This room is ready for a session.</p>}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><h3 className="text-xs font-bold text-slate-700">Peripheral Health & Configurations</h3><span className="text-[9px] font-semibold text-slate-400">{selected.peripherals.filter((item) => item.status === "Healthy").length}/{selected.peripherals.length} healthy</span></div>
                    {selectedIsaApp && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-blue-200 bg-blue-50/40">
                        <div className="flex items-center gap-3 p-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-white"><Icon name="settings" className="h-4 w-4" /></div>
                          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-[11px] font-bold text-slate-700">ISA App & Device Configuration</p><span className={`h-1.5 w-1.5 rounded-full ${statusStyles[selectedIsaApp.status].dot}`} /></div><p className="mt-0.5 text-[9px] text-slate-500">{selectedIsaApp.model} · Running</p></div>
                        </div>
                        <div className="grid grid-cols-1 gap-px bg-blue-100">
                          {[
                            ["CPaaS Vendor", selectedCpaasVendor?.model ?? "Not configured", selectedCpaasVendor?.status ?? "Warning"],
                            ["Codec", selectedCodecConfiguration ? `${selectedCodecConfiguration.model} · ${selectedCodecConfiguration.connection}` : "Not configured", selectedCodecConfiguration?.status ?? "Warning"],
                            ["Dual Monitor Mouse Support", selected.configuration.dualMonitorMouseSupport ? "True" : "False", selected.configuration.dualMonitorMouseSupport ? "Healthy" : "Warning"],
                          ].map(([label, value, state]) => <div key={label as string} className="flex items-center justify-between bg-white/90 p-2.5"><div><p className="text-[8px] text-slate-400">{label as string}</p><p className="mt-1 text-[9px] font-bold text-slate-700">{value as string}</p></div><span className={`h-1.5 w-1.5 rounded-full ${statusStyles[state as Status].dot}`} /></div>)}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {peripheralDevices(selected.peripherals).map((peripheral) => (
                        <div key={peripheral.name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                          <Icon name={peripheralIcon(peripheral.type)} className="h-4 w-4 shrink-0 text-slate-400" />
                          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-slate-600">{peripheral.name}</p></div>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${statusStyles[peripheral.status].dot}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className={roomPanelMode === "glance" ? "hidden" : ""}>
              {selected.session ? (
                <div className="mt-7">
                  <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Active session</h3><span className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-600"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" /><span className="relative h-2 w-2 rounded-full bg-blue-500" /></span>Connected · {selected.session.duration}</span></div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {[
                      ["Remote Technologist", selected.session.remoteTechnologist],
                      ["In-Suite Assistant", selected.session.inSuiteAssistant],
                    ].map(([role, person]) => {
                      const sessionUser = person as SessionUser;
                      return (
                        <div key={role as string} className="flex items-center gap-3 border-b border-slate-100 p-4">
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${(role as string) === "Remote Technologist" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>{sessionUser.name.split(" ").map((part) => part[0]).join("")}</div>
                          <div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{role as string}</p><p className="mt-0.5 text-sm font-bold text-slate-800">{sessionUser.name}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{sessionUser.email}</p></div>
                          <span className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Online</span>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/60">
                      <div className="px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Client</p><p className="mt-1 text-[11px] font-semibold text-slate-600">{selected.session.browser}</p></div>
                      <div className="px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Media route</p><p className="mt-1 text-[11px] font-semibold text-slate-600">TURN · us-central-2</p></div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Icon name="video" className="h-4 w-4 text-blue-600" /><h4 className="text-xs font-bold text-slate-700">WebRTC analytics</h4></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${selected.session.mos < 3.5 ? "bg-red-50 text-red-600" : selected.session.mos < 4.2 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>MOS {selected.session.mos} · {selected.session.mos < 3.5 ? "Poor" : selected.session.mos < 4.2 ? "Fair" : "Good"}</span></div>
                    <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">
                      {[
                        ["Round trip", `${selected.latency} ms`, selected.latency > 70],
                        ["Jitter", `${selected.jitter} ms`, selected.jitter > 30],
                        ["Packet loss", `${selected.packetLoss}%`, selected.packetLoss > 2],
                        ["Video bitrate", `${selected.session.bitrate} kbps`, false],
                        ["Frame rate", `${selected.session.fps} fps`, selected.session.fps < 24],
                        ["Codec", selected.session.codec, false],
                      ].map(([label, value, poor]) => (
                        <div key={label as string}><p className="text-[9px] font-medium text-slate-400">{label as string}</p><p className={`mt-1 text-xs font-bold ${poor ? "text-red-600" : "text-slate-700"}`}>{value as string}</p></div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"><div><p className="text-[9px] font-medium text-slate-400">Video stream</p><p className="mt-0.5 text-[11px] font-semibold text-slate-700">{selected.session.resolution} · {selected.session.codec}</p></div><div className="flex h-7 items-end gap-0.5">{[11,15,12,19,16,21,18,23,20,25,22,24].map((height, i) => <span key={i} className={`w-1 rounded-sm ${selected.session && selected.session.mos < 3.5 ? "bg-red-400" : "bg-blue-400"}`} style={{ height }} />)}</div></div>
                  </div>
                </div>
              ) : (
                <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400"><Icon name="user" className="h-5 w-5" /></div>
                  <p className="mt-3 text-sm font-bold text-slate-700">No active session</p>
                  <p className="mt-1 text-xs text-slate-400">This room is online and currently available.</p>
                </div>
              )}

              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Peripheral Health & Configurations</h3>
                  <span className={`text-[10px] font-semibold ${selected.peripherals.every((item) => item.status === "Healthy") ? "text-emerald-600" : "text-amber-600"}`}>
                    {selected.peripherals.filter((item) => item.status === "Healthy").length} of {selected.peripherals.length} healthy
                  </span>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {peripheralDevices(selected.peripherals).map((peripheral, index) => (
                    <div key={peripheral.name} className={`flex items-center gap-3 p-4 ${index < peripheralDevices(selected.peripherals).length - 1 ? "border-b border-slate-100" : ""}`}>
                      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${peripheral.status === "Critical" ? "bg-red-50 text-red-600" : peripheral.status === "Warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                        <Icon name={peripheralIcon(peripheral.type)} className="h-[18px] w-[18px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-slate-700">{peripheral.name}</p>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyles[peripheral.status].dot}`} />
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-slate-400">{[peripheral.model, peripheral.connection].filter(Boolean).join(" · ")}</p>
                        <p className="mt-0.5 text-[9px] font-medium text-slate-500">{peripheral.detail}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-bold ${peripheral.status === "Critical" ? "text-red-600" : peripheral.status === "Warning" ? "text-amber-600" : "text-emerald-600"}`}>{peripheral.status}</p>
                        <p className="mt-0.5 whitespace-nowrap text-[9px] text-slate-400">{peripheral.status === "Healthy" ? peripheral.detail : peripheral.status === "Critical" ? "Not responding" : "Signal degraded"}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {selected.peripherals.some((item) => item.status !== "Healthy") && (
                  <button className="mt-3 flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left">
                    <span className="flex items-center gap-2 text-[11px] font-semibold text-amber-800"><Icon name="alert" className="h-4 w-4" />Technology or service diagnostics recommended</span>
                    <Icon name="chevron" className="h-3.5 w-3.5 text-amber-500" />
                  </button>
                )}
              </div>

              <div className="mt-7 flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Live health metrics</h3><span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Updating live</span></div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MetricCard label="TechLive heartbeat" value={selected.status === "Critical" ? "Delayed" : "Online"} unit="" state={selected.status === "Critical" ? "Warning" : "Healthy"} detail="Current connection state" />
                <MetricCard label="Network latency" value={String(selected.latency)} unit="ms" state={selected.latency > 70 ? "Critical" : selected.latency > 35 ? "Warning" : "Healthy"} detail="Target: below 35 ms" />
                <MetricCard label="Jitter" value={String(selected.jitter)} unit="ms" state={selected.jitter > 30 ? "Critical" : selected.jitter > 10 ? "Warning" : "Healthy"} detail="Target: below 10 ms" />
                <MetricCard label="Packet loss" value={String(selected.packetLoss)} unit="%" state={selected.packetLoss > 2 ? "Critical" : selected.packetLoss > 0.5 ? "Warning" : "Healthy"} detail="Target: below 0.5%" />
              </div>

              <div className="mt-7 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Current network path</h3><span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Connected</span></div>
                <div className="mt-5 flex items-center">
                  {[
                    ["Room", selected.ip],
                    ["Edge", selected.region],
                    ["TURN", "Central"],
                    ["Service", `${selected.latency} ms`],
                  ].map(([label, value], index) => (
                    <div key={label} className="contents">
                      <div className="min-w-0 flex-1 text-center">
                        <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${index === 3 && selected.status !== "Healthy" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Icon name={index === 0 ? "monitor" : "network"} className="h-4 w-4" /></div>
                        <p className="mt-2 text-[10px] font-bold text-slate-600">{label}</p>
                        <p className="mt-0.5 truncate text-[9px] text-slate-400">{value}</p>
                      </div>
                      {index < 3 && <div className={`mb-7 h-px w-5 ${selected.status === "Critical" && index === 2 ? "bg-red-300" : "bg-emerald-300"}`} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Live checks</h3>
                <div className="mt-4 space-y-4">
                  {[
                    ["Room agent", selected.status === "Critical" ? "Heartbeat delayed" : "Connected", selected.status === "Critical" ? "Warning" : "Healthy"],
                    ["Network route", selected.status === "Healthy" ? "All thresholds normal" : "Threshold exceeded", selected.status],
                    ["Room technology", `${selected.peripherals.filter((item) => item.status === "Healthy").length} of ${selected.peripherals.length} devices and services healthy`, selected.peripherals.some((item) => item.status === "Critical") ? "Critical" : selected.peripherals.some((item) => item.status === "Warning") ? "Warning" : "Healthy"],
                  ].map(([check, value, state], i) => <div key={check} className="flex gap-3"><div className="flex flex-col items-center"><span className={`mt-1 h-2 w-2 rounded-full ${statusStyles[state as Status].dot}`} />{i < 2 && <span className="mt-1 h-8 w-px bg-slate-200" />}</div><div><p className="text-xs font-semibold text-slate-700">{check}</p><p className="mt-0.5 text-[10px] text-slate-400">{value}</p></div></div>)}
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <button className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">Run diagnostics</button>
                <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500">Open incident</button>
              </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
