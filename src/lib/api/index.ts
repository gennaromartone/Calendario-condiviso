/**
 * Client-side API barrel.
 * Re-exports from domain-specific modules.
 */

export {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventRecord,
  type CreateEventInput,
  type EventNotes,
} from "./events-api";

export {
  isPasswordSet,
  login,
  logout,
  getSession,
  completeProfile,
  getColorsAvailable,
  type LoginResult,
  type ColorOption,
} from "./auth-api";

export {
  exportBackup,
  downloadBackup,
  importBackup,
} from "./backup-api";

export {
  getAdminStatus,
  createUser,
  getAdminUsers,
  updateUserPassword,
  updateUserAffidamentoColore,
  deleteUser,
  type AdminUser,
} from "./admin-api";

