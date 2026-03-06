import { logger } from '../config/logger';
import { ScheduleRepository } from '../repositories/scheduleRepository';

export class ReaperService {
  constructor(private readonly scheduleRepository: ScheduleRepository = new ScheduleRepository()) {}

  async run(staleLockMinutes: number): Promise<void> {
    const released = await this.scheduleRepository.releaseStaleRunningSchedules(staleLockMinutes);
    released.forEach((item) => {
      logger.warn(
        {
          event: 'reaper_released_schedule',
          schedule_id: item.id
        },
        'reaper_released_schedule'
      );
    });
  }
}
