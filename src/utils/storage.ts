import { EventConfig, RegistrationRecord, PaxMember } from '../types';
import { DEFAULT_EVENT_CONFIG, INITIAL_REGISTRATIONS } from '../data/initialData';

const CONFIG_KEY = 'milan_event_config_v2';
const REGISTRATIONS_KEY = 'milan_registrations_v2';

export function loadEventConfig(): EventConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_EVENT_CONFIG;
    return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading config from localStorage', e);
    return DEFAULT_EVENT_CONFIG;
  }
}

export function saveEventConfig(config: EventConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to localStorage', e);
  }
}

export function loadRegistrations(): RegistrationRecord[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (!raw) {
      saveRegistrations(INITIAL_REGISTRATIONS);
      return INITIAL_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REGISTRATIONS;
  } catch (e) {
    console.error('Error loading registrations from localStorage', e);
    return INITIAL_REGISTRATIONS;
  }
}

export function saveRegistrations(regs: RegistrationRecord[]): void {
  try {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
  } catch (e) {
    console.error('Error saving registrations to localStorage', e);
  }
}

export function addRegistration(reg: RegistrationRecord): RegistrationRecord[] {
  const current = loadRegistrations();
  const updated = [reg, ...current.filter((r) => r.id !== reg.id)];
  saveRegistrations(updated);
  return updated;
}

export function updateRegistration(updatedRecord: RegistrationRecord): RegistrationRecord[] {
  const current = loadRegistrations();
  const updated = current.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
  saveRegistrations(updated);
  return updated;
}

export function updateRegistrationStatus(id: string, status: 'confirmed' | 'pending_verification'): RegistrationRecord[] {
  const current = loadRegistrations();
  const updated = current.map((r) => (r.id === id ? { ...r, paymentStatus: status } : r));
  saveRegistrations(updated);
  return updated;
}

export function updateRegistrationMembers(id: string, members: PaxMember[]): RegistrationRecord[] {
  const current = loadRegistrations();
  const updated = current.map((r) => (r.id === id ? { ...r, members } : r));
  saveRegistrations(updated);
  return updated;
}
