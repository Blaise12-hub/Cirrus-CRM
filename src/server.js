import "dotenv/config";
import app from "./app.js";
import { startReminderCron } from "./services/reminderService.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`CRM API listening on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== "test" && process.env.DISABLE_REMINDER_CRON !== "true") {
    startReminderCron();
  }
});

