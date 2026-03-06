import { MetricsRepository } from '../repositories/metricsRepository';

export class MetricsService {
  constructor(private readonly metricsRepository: MetricsRepository = new MetricsRepository()) {}

  async getDashboard(windowMinutes: number) {
    const [totals, stats] = await Promise.all([
      this.metricsRepository.dashboardTotals(),
      this.metricsRepository.executionStats(windowMinutes)
    ]);

    return {
      total_created: totals.totalCreated,
      total_success: totals.totalSuccess,
      total_failed: totals.totalFailed,
      total_expired: totals.totalExpired,
      total_cancelled: totals.totalCancelled,
      executions_per_minute: stats.executionsPerMinute,
      average_execution_latency: stats.averageExecutionLatency
    };
  }
}
