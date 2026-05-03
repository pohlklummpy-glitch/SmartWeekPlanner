import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, deleteDoc, updateDoc,
  onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { scheduleTaskNotification, cancelNotification } from '../services/NotificationService';

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const { user } = useAuth();
  const [tasks,      setTasks]      = useState([]);
  const [goals,      setGoals]      = useState([]);
  const [habits,     setHabits]     = useState({});
  const [focusMode,  setFocusMode]  = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // ── Push Notifications werden jetzt automatisch vom System gesendet ────────
  // Keine In-App-Checks mehr nötig - expo-notifications kümmert sich darum
  // auch wenn die App geschlossen ist oder das Handy im Standby ist!
  // Vorklingeln (preReminder) ist nur für Premium-User verfügbar.

  // ── Realtime listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      setTasks([]); setGoals([]); setHabits({});
      return;
    }

    // Tasks listener
    const tasksUnsub = onSnapshot(
      collection(db, 'users', user.id, 'tasks'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTasks(data.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')));
      },
      (e) => console.error('tasks listener:', e)
    );

    // Goals listener
    const goalsUnsub = onSnapshot(
      collection(db, 'users', user.id, 'goals'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setGoals(data);
      },
      (e) => console.error('goals listener:', e)
    );

    // Habits listener (single doc)
    const habitsUnsub = onSnapshot(
      doc(db, 'users', user.id, 'meta', 'habits'),
      (snap) => { if (snap.exists()) setHabits(snap.data()); },
      (e) => console.error('habits listener:', e)
    );

    return () => { tasksUnsub(); goalsUnsub(); habitsUnsub(); };
  }, [user?.id]);

  // ── Tasks ───────────────────────────────────────────────────────────────────
  const addTask = useCallback(async (taskData) => {
    if (!user?.id) return;
    const id = makeId();
    
    // Vorklingeln (preReminder) nur für Premium-User
    // Wenn kein Premium: preReminder wird auf null gesetzt
    const isPremium = user?.isPremium || false;
    const preReminder = isPremium ? (taskData.preReminder || null) : null;
    
    const task = {
      id,
      title:           taskData.title,
      day:             taskData.day,
      time:            taskData.time,
      category:        taskData.category  || 'other',
      color:           taskData.color     || '#6E5CF6',
      repeat:          taskData.repeat    || 'once',
      preReminder:     preReminder,
      completed:       false,
      completedByDate: {},
      notificationId:  null,
      createdAt:       new Date().toISOString(),
    };

    // Schedule push notification (funktioniert auch wenn App geschlossen ist!)
    const notifId = await scheduleTaskNotification(task);
    task.notificationId = notifId;

    // Update habits
    const habitKey  = `${task.day}_${task.title.toLowerCase()}`;
    const newHabits = { ...habits, [habitKey]: (habits[habitKey] || 0) + 1 };
    setHabits(newHabits);
    await setDoc(doc(db, 'users', user.id, 'meta', 'habits'), newHabits);

    await setDoc(doc(db, 'users', user.id, 'tasks', id), task);
    return task;
  }, [user?.id, habits]);

  const updateTask = useCallback(async (id, updates) => {
    if (!user?.id) return;
    
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    
    // Wenn Zeit, Tag oder preReminder geändert wird, Notification neu planen
    const needsReschedule = updates.time || updates.day !== undefined || updates.preReminder !== undefined;
    
    if (needsReschedule) {
      // Alte Notification löschen
      if (task.notificationId) {
        await cancelNotification(task.notificationId);
      }
      
      // Premium-Check für preReminder
      const isPremium = user?.isPremium || false;
      if (updates.preReminder !== undefined && !isPremium) {
        updates.preReminder = null;
      }
      
      // Neue Notification planen
      const updatedTask = { ...task, ...updates };
      const notifId = await scheduleTaskNotification(updatedTask);
      updates.notificationId = notifId;
    }
    
    await updateDoc(doc(db, 'users', user.id, 'tasks', id), updates);
  }, [user?.id, tasks]);

  const deleteTask = useCallback(async (id) => {
    if (!user?.id) return;
    const task = tasks.find((t) => t.id === id);
    if (task?.notificationId) await cancelNotification(task.notificationId);
    await deleteDoc(doc(db, 'users', user.id, 'tasks', id));
  }, [user?.id, tasks]);

  const completeTaskForDate = useCallback(async (id, dateStr) => {
    if (!user?.id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const completedByDate = { ...(task.completedByDate || {}) };
    if (completedByDate[dateStr]) {
      delete completedByDate[dateStr];
    } else {
      completedByDate[dateStr] = true;
    }
    const completed = task.repeat === 'once' ? !!completedByDate[dateStr] : task.completed;
    await updateDoc(doc(db, 'users', user.id, 'tasks', id), { completedByDate, completed });
  }, [user?.id, tasks]);

  const isTaskCompletedForDate = useCallback((task, dateStr) => {
    return !!(task.completedByDate || {})[dateStr];
  }, []);

  const copyTaskToDay = useCallback(async (taskId, targetDay) => {
    const original = tasks.find((t) => t.id === taskId);
    if (!original) return;
    const { id, notificationId, createdAt, completedByDate, completed, ...rest } = original;
    await addTask({ ...rest, day: targetDay });
  }, [tasks, addTask]);

  const getTasksForDay = useCallback((dayIndex) => {
    const result = [];
    tasks.forEach((t) => {
      if (t.day === dayIndex) {
        result.push({ ...t, _displayDay: dayIndex });
      } else if (t.repeat === 'weekly') {
        result.push({ ...t, _displayDay: dayIndex });
      }
    });
    return result.sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks]);

  // ── Goals ───────────────────────────────────────────────────────────────────
  const addGoal = useCallback(async (goalData) => {
    if (!user?.id) return;
    const id = makeId();
    const goal = {
      id,
      title:         goalData.title,
      category:      goalData.category     || 'sport',
      targetPerWeek: goalData.targetPerWeek || 3,
      createdAt:     new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.id, 'goals', id), goal);
    return goal;
  }, [user?.id]);

  const deleteGoal = useCallback(async (id) => {
    if (!user?.id) return;
    await deleteDoc(doc(db, 'users', user.id, 'goals', id));
  }, [user?.id]);

  const getGoalProgress = useCallback((goal) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const completed = tasks.filter((t) => {
      if (t.category !== goal.category) return false;
      return Object.keys(t.completedByDate || {}).some((d) => new Date(d) >= startOfWeek);
    });
    return Math.min(completed.length, goal.targetPerWeek);
  }, [tasks]);

  // ── Suggestions ─────────────────────────────────────────────────────────────
  const getSuggestions = useCallback(() => {
    const suggestions = [];
    Object.entries(habits).forEach(([key, count]) => {
      if (count >= 2) {
        const [dayStr, ...titleParts] = key.split('_');
        const title = titleParts.join(' ');
        const day   = parseInt(dayStr);
        const alreadyScheduled = tasks.some(
          (t) => t.day === day && t.title.toLowerCase() === title
        );
        if (!alreadyScheduled) suggestions.push({ day, title, count });
      }
    });
    return suggestions.slice(0, 2);
  }, [habits, tasks]);

  // ── Full stats ──────────────────────────────────────────────────────────────
  const getFullStats = useCallback(() => {
    const now      = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const startOfWeek = new Date(now);
    const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const total            = tasks.length;
    const completedToday   = tasks.filter((t) => (t.completedByDate || {})[todayStr]).length;
    const completedThisWeek = tasks.filter((t) =>
      Object.keys(t.completedByDate || {}).some((d) => new Date(d) >= startOfWeek)
    ).length;

    const byCategory = {};
    tasks.forEach((t) => { byCategory[t.category] = (byCategory[t.category] || 0) + 1; });

    const dailyCompletion = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const done = tasks.filter((t) => (t.completedByDate || {})[dStr]).length;
      return { day: i, date: dStr, done };
    });

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const hasAny = tasks.some((t) => (t.completedByDate || {})[dStr]);
      if (hasAny) streak++;
      else if (i > 0) break;
    }

    const dayCount = Array(7).fill(0);
    tasks.forEach((t) => {
      Object.keys(t.completedByDate || {}).forEach((d) => {
        const jsDay = new Date(d).getDay();
        const idx   = jsDay === 0 ? 6 : jsDay - 1;
        dayCount[idx]++;
      });
    });
    const bestDayIdx   = dayCount.indexOf(Math.max(...dayCount));
    const weeklyCount  = tasks.filter((t) => t.repeat === 'weekly').length;
    const onceCount    = tasks.filter((t) => t.repeat === 'once').length;
    const avgPerDay    = total > 0 ? (total / 7).toFixed(1) : '0';

    return {
      total, completedToday, completedThisWeek,
      byCategory, dailyCompletion, streak,
      bestDayIdx, weeklyCount, onceCount, avgPerDay,
      completionRate: total > 0 ? Math.round((completedThisWeek / total) * 100) : 0,
    };
  }, [tasks]);

  const startFocusMode = (task) => { setFocusMode(true);  setActiveTask(task); };
  const stopFocusMode  = ()     => { setFocusMode(false); setActiveTask(null); };

  return (
    <PlannerContext.Provider value={{
      tasks, goals, habits, focusMode, activeTask,
      addTask, updateTask, deleteTask, completeTaskForDate, isTaskCompletedForDate,
      copyTaskToDay, addGoal, deleteGoal, getGoalProgress, getSuggestions,
      startFocusMode, stopFocusMode, getTasksForDay, getFullStats,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() { return useContext(PlannerContext); }
