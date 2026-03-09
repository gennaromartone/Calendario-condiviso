/**
 * Client-side API for calendar operations.
 * Re-exports from domain-specific modules.
 * @see ./api/events-api
 * @see ./api/auth-api
 * @see ./api/backup-api
 * @see ./api/admin-api
 */

export {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventRecord,
  type CreateEventInput,
  type EventNotes,
} from "./api/events-api";

export {
  isPasswordSet,
  login,
  logout,
  getSession,
  completeProfile,
  getColorsAvailable,
  type LoginResult,
  type ColorOption,
} from "./api/auth-api";

export {
  exportBackup,
  downloadBackup,
  importBackup,
} from "./api/backup-api";

export {
  getAdminStatus,
  createUser,
  getAdminUsers,
  updateUserPassword,
  type AdminUser,
} from "./api/admin-api";

export {
  getInfoImportanti,
  createInfoImportante,
  updateInfoImportante,
  deleteInfoImportante,
  togglePinInfoImportante,
  type InfoImportanteRecord,
} from "./api/info-importanti-api";

export {
  getNotifiche,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificaRecord,
} from "./api/notifiche-api";
