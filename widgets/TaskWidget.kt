// Android Widget für Task Reminder
// Funktioniert nur mit Development Build!

package com.smartweekplanner.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.smartweekplanner.R

class TaskReminderWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update alle Widget-Instanzen
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Widget wurde zum ersten Mal hinzugefügt
    }

    override fun onDisabled(context: Context) {
        // Letztes Widget wurde entfernt
    }
}

internal fun updateAppWidget(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int
) {
    // Beispiel-Daten (später aus App holen)
    val taskTitle = "Joggen"
    val taskTime = "15:00"
    val minutesUntil = 15
    val taskColor = "#6E5CF6"

    // Widget Layout erstellen
    val views = RemoteViews(context.packageName, R.layout.task_reminder_widget)
    
    // Daten setzen
    views.setTextViewText(R.id.widget_title, taskTitle)
    views.setTextViewText(R.id.widget_time, taskTime)
    views.setTextViewText(R.id.widget_reminder, "in $minutesUntil Min")
    
    // Farbe setzen (Task-Farbe als Akzent)
    val color = android.graphics.Color.parseColor(taskColor)
    views.setInt(R.id.widget_background, "setBackgroundColor", color and 0x33FFFFFF)
    views.setTextColor(R.id.widget_reminder, color)

    // Widget updaten
    appWidgetManager.updateAppWidget(appWidgetId, views)
}
