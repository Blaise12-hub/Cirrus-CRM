import cron from "node-cron";
import pool from "../db/pool.js";

/**
 * Checks for due and overdue tasks and creates notifications for assignees.
 * Avoids duplicate notifications within 24 hours for the same task & condition.
 */
export async function checkAndCreateTaskReminders() {
  const client = await pool.connect();
  try {
    // 1. Check overdue tasks (due_date < now() and still pending)
    const overdueResult = await client.query(`
      SELECT a.activity_id, a.subject, a.due_date, a.owner_id
      FROM crm.activities a
      WHERE a.type = 'task'
        AND a.status = 'pending'
        AND a.owner_id IS NOT NULL
        AND a.due_date IS NOT NULL
        AND a.due_date < now()
        AND (a.deleted_at IS NULL)
        AND NOT EXISTS (
          SELECT 1 FROM crm.notifications n
          WHERE n.activity_id = a.activity_id
            AND n.type = 'task_overdue'
            AND n.created_at >= now() - INTERVAL '24 hours'
        )
    `);

    for (const task of overdueResult.rows) {
      await client.query(
        `INSERT INTO crm.notifications (user_id, activity_id, type, title, message, due_date)
         VALUES ($1, $2, 'task_overdue', $3, $4, $5)`,
        [
          task.owner_id,
          task.activity_id,
          `Task Overdue: ${task.subject}`,
          `Your task "${task.subject}" was due on ${new Date(task.due_date).toLocaleString()}.`,
          task.due_date,
        ]
      );
    }

    // 2. Check tasks due soon (within next 24 hours and still pending)
    const dueSoonResult = await client.query(`
      SELECT a.activity_id, a.subject, a.due_date, a.owner_id
      FROM crm.activities a
      WHERE a.type = 'task'
        AND a.status = 'pending'
        AND a.owner_id IS NOT NULL
        AND a.due_date IS NOT NULL
        AND a.due_date >= now()
        AND a.due_date <= now() + INTERVAL '24 hours'
        AND (a.deleted_at IS NULL)
        AND NOT EXISTS (
          SELECT 1 FROM crm.notifications n
          WHERE n.activity_id = a.activity_id
            AND n.type = 'task_due'
            AND n.created_at >= now() - INTERVAL '24 hours'
        )
    `);

    for (const task of dueSoonResult.rows) {
      await client.query(
        `INSERT INTO crm.notifications (user_id, activity_id, type, title, message, due_date)
         VALUES ($1, $2, 'task_due', $3, $4, $5)`,
        [
          task.owner_id,
          task.activity_id,
          `Task Due Soon: ${task.subject}`,
          `Your task "${task.subject}" is due on ${new Date(task.due_date).toLocaleString()}.`,
          task.due_date,
        ]
      );
    }

    const summary = {
      overdueCreated: overdueResult.rows.length,
      dueSoonCreated: dueSoonResult.rows.length,
      timestamp: new Date().toISOString(),
    };
    return summary;
  } catch (err) {
    console.error("Error creating task reminders:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Starts the reminder cron job. Default runs hourly ("0 * * * *").
 */
export function startReminderCron(schedule = process.env.REMINDER_CRON_SCHEDULE || "0 * * * *") {
  console.log(`[Reminders] Initializing task reminder cron job with schedule: "${schedule}"`);
  const job = cron.schedule(schedule, async () => {
    try {
      const result = await checkAndCreateTaskReminders();
      if (result.overdueCreated > 0 || result.dueSoonCreated > 0) {
        console.log(`[Reminders] Created ${result.overdueCreated} overdue and ${result.dueSoonCreated} due-soon notifications.`);
      }
    } catch (err) {
      console.error("[Reminders] Cron execution failed:", err);
    }
  });

  return job;
}
