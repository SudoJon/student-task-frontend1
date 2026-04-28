// src/api/calendar.js
import { getTasks } from "./tasks";

/**
 * Calendar API wrapper
 * Loads tasks and normalizes them for the Calendar UI.
 */
export async function getCalendarTasks() {
    const raw = await getTasks();

    // Normalize backend fields → frontend Calendar shape
    return raw.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date?.split("T")[0] || null, // convert ISO → YYYY-MM-DD
    }));
}
