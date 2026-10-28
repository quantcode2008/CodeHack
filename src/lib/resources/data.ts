import { type RequirementType, type ResourceCategory } from "@/lib/supabase/types";

export interface ResourceOwner {
  id: string;
  name: string;
  title: string;
  department: string;
  avatarUrl: string;
  verified: boolean;
  responseTime: string;
}

export interface ResourceRequirementItem {
  id: string;
  label: string;
  type: RequirementType;
  description: string;
  requiresDocument: boolean;
}

export interface ResourceSpecItem {
  label: string;
  value: string;
}

export interface FairUsePolicy {
  weeklyCapHours: number;
  maxActiveBookings: number;
  cooldownHours: number;
  consecutiveDayLimit: number;
}

export interface AvailabilitySlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  dateStr: string;
  timeRange: string;
  status: "open" | "booked" | "blackout";
  bookedBy?: string;
  reason?: string;
}

export interface CampusResource {
  id: string;
  slug: string;
  title: string;
  category: ResourceCategory;
  categoryLabel: string;
  description: string;
  locationText: string;
  building: string;
  room: string;
  lat: number;
  lng: number;
  photos: string[];
  capacity: number;
  requiresSupervision: boolean;
  supervisionNote?: string;
  depositAmount: number;
  creditCostPerHour: number;
  maxBookingHours: number;
  minNoticeHours: number;
  usageRules: string[];
  specs: ResourceSpecItem[];
  accessInstructions: string;
  fairUse: FairUsePolicy;
  owner: ResourceOwner;
  requirements: ResourceRequirementItem[];
  status: "listed" | "draft" | "paused";
  nextAvailableSlot: string;
  weeklySchedule: AvailabilitySlot[];
}

export const CAMPUS_RESOURCES: CampusResource[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    slug: "prusa-mk4-bench-a",
    title: "Prusa MK4 Precision 3D Printer (Bench A)",
    category: "device",
    categoryLabel: "Prototyping Device",
    description:
      "High-speed precision FDM 3D printer featuring Nextruder loadcell automatic bed leveling, 0.4mm brass nozzle, and magnetic textured PEI spring sheet. Engineered for rapid mechanical iterations and structural jigs.",
    locationText: "Fabrication Lab, Room 104, East Engineering Wing",
    building: "East Engineering Wing",
    room: "Room 104",
    lat: 42.3601,
    lng: -71.0942,
    photos: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
    ],
    capacity: 1,
    requiresSupervision: false,
    depositAmount: 0.0,
    creditCostPerHour: 0.0,
    maxBookingHours: 6,
    minNoticeHours: 2,
    usageRules: [
      "Use approved PLA and PETG filament only (no abrasive glow or carbon fills on this brass nozzle).",
      "Clean PEI sheet with 99% isopropyl alcohol before and after each print job.",
      "Remain in the lab for the first 3 layers to verify build plate adhesion.",
      "Clear completed parts immediately upon timer expiration.",
    ],
    specs: [
      { label: "Build Volume", value: "250 × 210 × 220 mm" },
      { label: "Layer Resolution", value: "0.05 – 0.30 mm" },
      { label: "Max Nozzle Temp", value: "300 °C" },
      { label: "Filament Diameter", value: "1.75 mm" },
    ],
    accessInstructions:
      "Tap student ID badge at the exterior Fab Lab 104 card reader. Slicer workstations are logged in with your Eastbrook Google account.",
    fairUse: {
      weeklyCapHours: 12.0,
      maxActiveBookings: 2,
      cooldownHours: 4,
      consecutiveDayLimit: 3,
    },
    owner: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Dr. Kavitha Rao",
      title: "Fab Lab Director & Assoc. Professor",
      department: "Department of Mechanical Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      verified: true,
      responseTime: "< 2 hours",
    },
    requirements: [
      {
        id: "req-prusa-01",
        label: "FDM 3D Printing Fundamentals",
        type: "qualification",
        description: "Completed online slicing primer covering PrusaSlicer parameters and build sheet care.",
        requiresDocument: false,
      },
    ],
    status: "listed",
    nextAvailableSlot: "Today, 14:00 - 17:00",
    weeklySchedule: [
      { day: "Mon", dateStr: "Oct 26", timeRange: "09:00 - 12:00", status: "booked", bookedBy: "ME-301 Lab" },
      { day: "Mon", dateStr: "Oct 26", timeRange: "13:00 - 17:00", status: "open" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "09:00 - 13:00", status: "open" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "14:00 - 18:00", status: "booked" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "10:00 - 14:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "14:00 - 20:00", status: "open" },
      { day: "Thu", dateStr: "Oct 29", timeRange: "09:00 - 15:00", status: "open" },
      { day: "Fri", dateStr: "Oct 30", timeRange: "10:00 - 16:00", status: "open" },
      { day: "Sat", dateStr: "Oct 31", timeRange: "12:00 - 18:00", status: "open" },
      { day: "Sun", dateStr: "Nov 01", timeRange: "12:00 - 18:00", status: "blackout", reason: "Maintenance & Bed Leveling" },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    slug: "sony-fx3-cinema-kit",
    title: "Sony FX3 Full-Frame Cinema Camera Kit",
    category: "device",
    categoryLabel: "Media & Cinema Apparatus",
    description:
      "Professional 4K 120p full-frame cinema production package. Includes top XLR audio handle unit, Sony FE 24-70mm f/2.8 GM II zoom lens, 2x 160GB Tough CFexpress Type A cards, 4x NP-FZ100 batteries, dual charger, and Pelican storm case.",
    locationText: "AV Equipment Vault, Library Basement Room B12",
    building: "Central Library",
    room: "Room B12",
    lat: 42.3608,
    lng: -71.0945,
    photos: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    ],
    capacity: 1,
    requiresSupervision: false,
    depositAmount: 250.0,
    creditCostPerHour: 5.0,
    maxBookingHours: 24,
    minNoticeHours: 12,
    usageRules: [
      "Mandatory physical condition inspection with AV technician at pickup and return.",
      "Keep lens body sealed when exchanging optics; do not expose open sensor to ambient airflow.",
      "Transport camera exclusively inside the provided Pelican storm case.",
      "Overdue returns incur automatic academic suspension of borrowing privileges.",
    ],
    specs: [
      { label: "Sensor", value: "12.1MP Full-Frame Exmor R CMOS" },
      { label: "Video Formats", value: "4K UHD up to 120p, 10-Bit 4:2:2" },
      { label: "Dynamic Range", value: "15+ Stops S-Log3" },
      { label: "Lens Mount", value: "Sony E-Mount (24-70mm GM II included)" },
    ],
    accessInstructions:
      "Check in at the Library Basement B12 AV desk with physical student ID. Staff will run the physical condition check-in checklist with you.",
    fairUse: {
      weeklyCapHours: 24.0,
      maxActiveBookings: 1,
      cooldownHours: 48,
      consecutiveDayLimit: 2,
    },
    owner: {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Imran Syed",
      title: "AV Facilities Manager",
      department: "Media Arts & Instructional Technology",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      verified: true,
      responseTime: "< 1 hour",
    },
    requirements: [
      {
        id: "req-sony-01",
        label: "AV Media Vault Equipment Induction",
        type: "training",
        description: "Hands-on briefing on full-frame sensor care, lens mounting, and storm case transport.",
        requiresDocument: false,
      },
      {
        id: "req-sony-02",
        label: "Signed Equipment Liability Waiver",
        type: "document",
        description: "Physical liability agreement signed for high-value media apparatus loan.",
        requiresDocument: true,
      },
    ],
    status: "listed",
    nextAvailableSlot: "Tomorrow, 09:00 - 17:00",
    weeklySchedule: [
      { day: "Mon", dateStr: "Oct 26", timeRange: "09:00 - 17:00", status: "booked", bookedBy: "Doc Film Crew" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "09:00 - 17:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "09:00 - 17:00", status: "open" },
      { day: "Thu", dateStr: "Oct 29", timeRange: "09:00 - 17:00", status: "open" },
      { day: "Fri", dateStr: "Oct 30", timeRange: "09:00 - 21:00", status: "open" },
      { day: "Sat", dateStr: "Oct 31", timeRange: "10:00 - 18:00", status: "open" },
      { day: "Sun", dateStr: "Nov 01", timeRange: "10:00 - 18:00", status: "open" },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    slug: "epilog-fusion-pro-laser",
    title: "Epilog Fusion Pro 48 Dual-Source Laser Cutter",
    category: "equipment",
    categoryLabel: "High-Power Fabrication",
    description:
      "60W CO2 + 30W Fiber dual-source laser cutter featuring Iris Camera Positioning for pinpoint alignment. Rapid engraving and cutting of acrylic, plywood, leather, anodized aluminum, and Delrin with industrial exhaust filtration.",
    locationText: "Fabrication Lab, Room 104, East Engineering Wing",
    building: "East Engineering Wing",
    room: "Room 104",
    lat: 42.3601,
    lng: -71.0942,
    photos: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    ],
    capacity: 2,
    requiresSupervision: true,
    supervisionNote: "Lab monitor or faculty custodian must be present in Room 104 during laser firing.",
    depositAmount: 50.0,
    creditCostPerHour: 0.0,
    maxBookingHours: 3,
    minNoticeHours: 4,
    usageRules: [
      "No PVC, vinyl, or unknown chlorine-bearing plastics (produces toxic hydrochloric gas).",
      "Always verify fume extractor is actively drawing before pressing start.",
      "Never leave the laser unattended while cutting; watch for flame flare-ups.",
      "Wear OD5+ laser-rated safety glasses throughout cutting cycle.",
    ],
    specs: [
      { label: "Laser Power", value: "60W CO2 / 30W Fiber" },
      { label: "Bed Area", value: "1219 × 914 mm (48 × 36 in)" },
      { label: "Camera", value: "Dual 5MP Overhead Iris Cameras" },
      { label: "Max Speed", value: "165 IPS (4.2 m/s)" },
    ],
    accessInstructions:
      "Present digital booking pass to monitor on duty in Fab Lab 104. Verify stock material thickness on the digital caliper before loading.",
    fairUse: {
      weeklyCapHours: 6.0,
      maxActiveBookings: 1,
      cooldownHours: 12,
      consecutiveDayLimit: 2,
    },
    owner: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Dr. Kavitha Rao",
      title: "Fab Lab Director",
      department: "Mechanical Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      verified: true,
      responseTime: "< 2 hours",
    },
    requirements: [
      {
        id: "req-epilog-01",
        label: "Laser Safety Certification Level 1",
        type: "training",
        description: "Mandatory 45-minute lab safety training covering optical hazards, ventilation protocols, and material restrictions.",
        requiresDocument: false,
      },
      {
        id: "req-epilog-02",
        label: "Fabrication Lab Proximity Card",
        type: "authorisation",
        description: "Active campus RFID proximity pass programmed with Eastbrook Fab Lab access clearance.",
        requiresDocument: false,
      },
    ],
    status: "listed",
    nextAvailableSlot: "Today, 14:00 - 16:30",
    weeklySchedule: [
      { day: "Mon", dateStr: "Oct 26", timeRange: "10:00 - 12:30", status: "booked" },
      { day: "Mon", dateStr: "Oct 26", timeRange: "14:00 - 16:30", status: "open" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "13:00 - 16:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "10:00 - 13:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "14:00 - 16:30", status: "open" },
      { day: "Thu", dateStr: "Oct 29", timeRange: "11:00 - 14:00", status: "open" },
      { day: "Fri", dateStr: "Oct 30", timeRange: "13:00 - 17:00", status: "open" },
      { day: "Sat", dateStr: "Oct 31", timeRange: "12:00 - 16:00", status: "open" },
      { day: "Sun", dateStr: "Nov 01", timeRange: "12:00 - 16:00", status: "blackout", reason: "Optics Alignment" },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    slug: "podcast-studio-room-305",
    title: "Soundproof Media & Podcast Recording Studio",
    category: "space",
    categoryLabel: "Acoustic Suite",
    description:
      "Acoustically isolated 4-person broadcast recording studio equipped with 4x Shure SM7B dynamic microphones, Cloudlifter CL-4 mic activators, RØDECaster Pro II integrated console, audio monitoring headphones, and dimmable 3-point video lighting.",
    locationText: "Media Arts Center, Room 305, Central Campus",
    building: "Media Arts Center",
    room: "Room 305",
    lat: 42.361,
    lng: -71.095,
    photos: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    ],
    capacity: 4,
    requiresSupervision: false,
    depositAmount: 0.0,
    creditCostPerHour: 0.0,
    maxBookingHours: 3,
    minNoticeHours: 1,
    usageRules: [
      "Strictly no open liquids, food, or sodas inside the acoustic booth.",
      "Bring your own high-speed microSD card or USB-C drive for multi-track WAV capture.",
      "Reset all motorized faders and power down microphone preamps before leaving.",
      "Keep heavy acoustic glass door securely latched during recording.",
    ],
    specs: [
      { label: "Microphones", value: "4x Shure SM7B with pop filters" },
      { label: "Interface", value: "RØDECaster Pro II (32-bit float)" },
      { label: "Sound Isolation", value: "STC 55 Dual-Wall Construction" },
      { label: "Lighting", value: "Elgato Key Light Air + RGB Fill" },
    ],
    accessInstructions:
      "Room 305 electronic keypad unlock code is delivered in your booking confirmation 15 minutes before your reserved start time.",
    fairUse: {
      weeklyCapHours: 6.0,
      maxActiveBookings: 2,
      cooldownHours: 6,
      consecutiveDayLimit: 2,
    },
    owner: {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Imran Syed",
      title: "Audio Coordinator",
      department: "Media Arts Center",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      verified: true,
      responseTime: "< 1 hour",
    },
    requirements: [
      {
        id: "req-podcast-01",
        label: "Audio Suite Orientation",
        type: "training",
        description: "15-minute briefing on soundboard routing and microphone hygiene.",
        requiresDocument: false,
      },
    ],
    status: "listed",
    nextAvailableSlot: "Today, 17:00 - 19:30",
    weeklySchedule: [
      { day: "Mon", dateStr: "Oct 26", timeRange: "10:00 - 13:00", status: "booked" },
      { day: "Mon", dateStr: "Oct 26", timeRange: "14:00 - 17:00", status: "open" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "11:00 - 14:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "14:00 - 17:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "17:00 - 20:00", status: "open" },
      { day: "Thu", dateStr: "Oct 29", timeRange: "12:00 - 18:00", status: "open" },
      { day: "Fri", dateStr: "Oct 30", timeRange: "10:00 - 16:00", status: "open" },
      { day: "Sat", dateStr: "Oct 31", timeRange: "13:00 - 19:00", status: "open" },
      { day: "Sun", dateStr: "Nov 01", timeRange: "13:00 - 19:00", status: "open" },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    slug: "rf-electronics-testbench",
    title: "RF & Mixed-Signal Electronics Testbench",
    category: "equipment",
    categoryLabel: "Laboratory Bench",
    description:
      "Precision RF diagnostics station equipped with Rigol MSO5354 4-channel 350MHz digital oscilloscope (with 16 logic analyzer channels), Siglent SPD3303X triple-output linear DC bench power supply, and Siglent SDG2042X arbitrary waveform generator.",
    locationText: "Maxwell Tower, Room 202, Bench 04, EE North Wing",
    building: "Maxwell Tower",
    room: "Room 202, Bench 04",
    lat: 42.3605,
    lng: -71.0935,
    photos: [
      "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80",
    ],
    capacity: 2,
    requiresSupervision: false,
    depositAmount: 0.0,
    creditCostPerHour: 0.0,
    maxBookingHours: 4,
    minNoticeHours: 1,
    usageRules: [
      "ESD grounding wrist strap is mandatory throughout IC testing.",
      "Check DC power supply current limit before toggling output on sensitive microcontrollers.",
      "Return oscilloscope probes to hanging holster; do not crimp BNC coax leads.",
    ],
    specs: [
      { label: "Scope Bandwidth", value: "350 MHz, 4 Analog + 16 Digital" },
      { label: "Sampling Rate", value: "8 GSa/s real-time" },
      { label: "Power Supply", value: "Dual 32V/3.2A + 5V/3A isolated" },
      { label: "Waveform Gen", value: "40 MHz Sine/Square/Arb" },
    ],
    accessInstructions:
      "Room 202 keycard access is automatically provisioned to enrolled ECE and MechEng student accounts.",
    fairUse: {
      weeklyCapHours: 12.0,
      maxActiveBookings: 2,
      cooldownHours: 2,
      consecutiveDayLimit: 4,
    },
    owner: {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Imran Syed",
      title: "EE Lab Coordinator",
      department: "Electrical & Computer Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      verified: true,
      responseTime: "< 1 hour",
    },
    requirements: [
      {
        id: "req-rf-01",
        label: "Electrical Lab Safety Orientation",
        type: "training",
        description: "Basic ESD protocol, high-voltage lead safety, and solder ventilation.",
        requiresDocument: false,
      },
    ],
    status: "listed",
    nextAvailableSlot: "Today, 11:30 - 15:30",
    weeklySchedule: [
      { day: "Mon", dateStr: "Oct 26", timeRange: "09:00 - 13:00", status: "open" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "09:00 - 13:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "11:30 - 15:30", status: "open" },
      { day: "Thu", dateStr: "Oct 29", timeRange: "13:00 - 17:00", status: "open" },
      { day: "Fri", dateStr: "Oct 30", timeRange: "09:00 - 16:00", status: "open" },
      { day: "Sat", dateStr: "Oct 31", timeRange: "10:00 - 18:00", status: "open" },
      { day: "Sun", dateStr: "Nov 01", timeRange: "10:00 - 18:00", status: "open" },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006",
    slug: "shopbot-cnc-router",
    title: "ShopBot PRSalpha 4×8 CNC Wood Router",
    category: "equipment",
    categoryLabel: "Industrial Milling",
    description:
      "Industrial 3-axis CNC router with a 96 × 48 inch vacuum hold-down bed, 5HP variable-frequency spindle, and high-efficiency dust collection. Capable of precision joinery, furniture prototyping, architectural facades, and vacuum-forming tooling.",
    locationText: "Digital Fabrication High Bay, Building C, Room 110",
    building: "Building C High Bay",
    room: "Room 110",
    lat: 42.3615,
    lng: -71.096,
    photos: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    ],
    capacity: 2,
    requiresSupervision: true,
    supervisionNote: "Supervising technician must verify toolpath zeroing and material hold-down before cycle start.",
    depositAmount: 100.0,
    creditCostPerHour: 4.0,
    maxBookingHours: 4,
    minNoticeHours: 24,
    usageRules: [
      "Inspect stock material for hidden screws, staples, or metal debris before mounting.",
      "Ear protection, safety glasses, and closed-toe footwear are strictly mandatory in the High Bay.",
      "Vacuum table seal must be verified under negative pressure before engaging spindle.",
    ],
    specs: [
      { label: "Working Area", value: "2440 × 1220 × 150 mm (8 × 4 ft)" },
      { label: "Spindle", value: "5 HP HSD Air-Cooled (18,000 RPM)" },
      { label: "Hold-Down", value: "4-Zone Vacuum Bed" },
      { label: "Repeatability", value: "± 0.05 mm" },
    ],
    accessInstructions:
      "Report to Building C High Bay control desk. Submit your CAM toolpath simulation file (Fusion 360 or VCarve) for tool clearance sign-off.",
    fairUse: {
      weeklyCapHours: 8.0,
      maxActiveBookings: 1,
      cooldownHours: 24,
      consecutiveDayLimit: 2,
    },
    owner: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Dr. Kavitha Rao",
      title: "Fab Lab Director",
      department: "Mechanical Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      verified: true,
      responseTime: "< 2 hours",
    },
    requirements: [
      {
        id: "req-cnc-01",
        label: "Workshop Safety Orientation",
        type: "training",
        description: "General machine shop safety protocol and emergency stop procedures.",
        requiresDocument: false,
      },
      {
        id: "req-cnc-02",
        label: "Digital Fabrication CNC Level 2",
        type: "qualification",
        description: "Prerequisite course qualification (ME-204 or equivalent machine shop sign-off).",
        requiresDocument: false,
      },
    ],
    status: "listed",
    nextAvailableSlot: "Tomorrow, 13:00 - 17:00",
    weeklySchedule: [
      { day: "Mon", dateStr: "Oct 26", timeRange: "09:00 - 13:00", status: "booked" },
      { day: "Tue", dateStr: "Oct 27", timeRange: "13:00 - 17:00", status: "open" },
      { day: "Wed", dateStr: "Oct 28", timeRange: "09:00 - 13:00", status: "open" },
      { day: "Thu", dateStr: "Oct 29", timeRange: "13:00 - 17:00", status: "open" },
      { day: "Fri", dateStr: "Oct 30", timeRange: "09:00 - 13:00", status: "open" },
      { day: "Sat", dateStr: "Oct 31", timeRange: "10:00 - 14:00", status: "blackout", reason: "Sacrificial Spoilboard Surfacing" },
      { day: "Sun", dateStr: "Nov 01", timeRange: "10:00 - 14:00", status: "open" },
    ],
  },
];

