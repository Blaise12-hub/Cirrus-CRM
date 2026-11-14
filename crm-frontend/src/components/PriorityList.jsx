import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, Tooltip, Alert } from "@mui/material";
import { Phone, Mail, Users, CheckSquare, FileText, Circle, CheckCircle2 } from "lucide-react";
import { activitiesApi } from "../api/resources";
import { TimelineSkeleton } from "./Skeleton";
import { Pill } from "./DashUi";
import { fmtDueDate, parentLink } from "../utils/activityUi";
import { mergeTasks, bucketPill, taskIconKey, taskSubline } from "../utils/dashboardUi";

const ICONS = { call: Phone, email: Mail, meeting: Users, task: CheckSquare, note: FileText };

// Flat "Today's priorities" list: overdue first, then due today (server-bucketed).
// Same endpoints as MyTasksWidget (activitiesApi.mine / update), different presentation.
export default function PriorityList({ limit = 5 }) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [overdue, today] = await Promise.all([activitiesApi.mine("overdue"), activitiesApi.mine("today")]);
                if (!cancelled) setTasks(mergeTasks(overdue, today, limit));
            } catch (err) {
                if (!cancelled) setError(err.message || "Could not load tasks");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [limit]);

    const complete = useCallback(async (task) => {
        setError("");
        setTasks((prev) => prev.map((t) => (t.activity_id === task.activity_id ? { ...t, status: "completed" } : t)));
        try {
            await activitiesApi.update(task.activity_id, { status: "completed" });
        } catch (err) {
            setTasks((prev) => prev.map((t) => (t.activity_id === task.activity_id ? { ...t, status: task.status } : t)));
            setError(err.message || "Could not update task");
        }
    }, []);

    if (loading) return <TimelineSkeleton rows={3} />;

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            {!error && tasks.length === 0 && (
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Nothing overdue or due today. You're all caught up.</Typography>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {tasks.map((task) => {
                    const done = task.status === "completed";
                    const overdue = task.bucket === "overdue" && !done;
                    const Icon = ICONS[taskIconKey(task.type)];
                    const link = parentLink(task);
                    const pill = bucketPill(task.bucket);
                    return (
                        <Box
                            key={task.activity_id}
                            onClick={link ? () => navigate(link.to) : undefined}
                            sx={{
                                display: "flex", alignItems: "center", gap: 1.5, p: 1.25, borderRadius: "12px",
                                bgcolor: "action.hover", cursor: link ? "pointer" : "default",
                                opacity: done ? 0.6 : 1, "&:hover": link ? { bgcolor: "action.selected" } : undefined,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 34, height: 34, borderRadius: "10px", flexShrink: 0, display: "grid", placeItems: "center",
                                    bgcolor: overdue ? "error.light" : "accent.light", color: overdue ? "error.main" : "accent.dark",
                                }}
                            >
                                <Icon size={16} aria-hidden />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{task.subject}</Typography>
                                <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>{taskSubline(link, fmtDueDate(task.due_date))}</Typography>
                            </Box>
                            <Pill tone={pill.tone}>{pill.label}</Pill>
                            <Tooltip title={done ? "Completed" : "Mark as done"}>
                                <span>
                                    <IconButton
                                        size="small"
                                        disabled={done}
                                        aria-label={done ? "Completed" : `Mark "${task.subject}" as done`}
                                        onClick={(e) => { e.stopPropagation(); complete(task); }}
                                        sx={{ color: done ? "success.main" : "text.disabled" }}
                                    >
                                        {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}