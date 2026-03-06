import { prisma } from '../config/prisma';

export class MetricsRepository {
  async dashboardTotals() {
    const [
      totalCreated,
      totalSuccess,
      totalFailed,
      totalExpired,
      totalCancelled
    ] = await Promise.all([
      prisma.schedule.count(),
      prisma.schedule.count({ where: { status: 'success' } }),
      prisma.schedule.count({ where: { status: 'failed' } }),
      prisma.schedule.count({ where: { status: 'expired' } }),
      prisma.schedule.count({ where: { status: 'cancelled' } })
    ]);

    return {
      totalCreated,
      totalSuccess,
      totalFailed,
      totalExpired,
      totalCancelled
    };
  }

  async executionStats(windowMinutes: number) {
    const stats = await prisma.$queryRaw<Array<{ executions_per_minute: number; average_execution_latency: number | null }>>`
      SELECT
        (COUNT(*)::float / ${windowMinutes}::float) AS executions_per_minute,
        AVG(duration_ms)::float AS average_execution_latency
      FROM execution_logs
      WHERE executed_at >= NOW() - make_interval(mins => ${windowMinutes});
    `;

    return {
      executionsPerMinute: stats[0]?.executions_per_minute ?? 0,
      averageExecutionLatency: stats[0]?.average_execution_latency ?? 0
    };
  }
}
