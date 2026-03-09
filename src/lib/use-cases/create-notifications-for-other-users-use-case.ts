import type { INotificationRepository } from "@/lib/repositories";
import type { IUserRepository } from "@/lib/repositories";
import type { NotificaTipo, NotificaEntityType } from "@/lib/repositories";

export type CreateNotificationsInput = {
  autoreId: string;
  tipo: NotificaTipo;
  entityType: NotificaEntityType;
  entityId: string | null;
  titolo: string;
};

const NOTIFICATION_TYPES: NotificaTipo[] = [
  "evento_aggiunto",
  "evento_modificato",
  "evento_eliminato",
  "info_aggiunta",
  "info_modificata",
  "info_eliminata",
];

export class CreateNotificationsForOtherUsersUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: CreateNotificationsInput): Promise<void> {
    const userIds = await this.userRepository.findAllIds();
    const recipientIds = userIds.filter((id) => id !== input.autoreId);
    if (recipientIds.length === 0) return;

    const isTipoValid = NOTIFICATION_TYPES.includes(input.tipo);
    if (!isTipoValid) return;

    const notifications = recipientIds.map((utenteId) => ({
      utenteId,
      tipo: input.tipo,
      entityType: input.entityType,
      entityId: input.entityId,
      titolo: input.titolo,
      autoreId: input.autoreId,
    }));

    await this.notificationRepository.createMany(notifications);
  }
}
