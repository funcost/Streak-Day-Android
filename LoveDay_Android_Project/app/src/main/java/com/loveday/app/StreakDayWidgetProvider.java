package com.loveday.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/** Normal launcher home-screen widget. It does not draw over other apps. */
public class StreakDayWidgetProvider extends AppWidgetProvider {
    private static final String PREFS = "streak_day_widget";

    public static void updateAll(Context context, String name, String days, String accent, String symbol, String startDate, String status, String fixedDate) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putString("name", safe(name, "Streak Day"))
                .putString("days", safe(days, "0 ngày"))
                .putString("accent", safe(accent, "#ED4D83"))
                .putString("symbol", safe(symbol, "♥"))
                .putString("startDate", safe(startDate, ""))
                .putString("status", safe(status, "active"))
                .putString("fixedDate", safe(fixedDate, "")).apply();
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, StreakDayWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        for (int id : ids) updateWidget(context, manager, id);
    }

    private static String safe(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }

    private static int parseColor(String value) {
        try { return Color.parseColor(value); }
        catch (Exception ignored) { return Color.rgb(237, 77, 131); }
    }


    private static String calculateDays(SharedPreferences prefs) {
        String start = prefs.getString("startDate", "");
        if (start == null || start.isEmpty()) return "0 ngày";
        String status = prefs.getString("status", "active");
        String end = "active".equals(status) ? new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()) : prefs.getString("fixedDate", "");
        try {
            SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            fmt.setLenient(false);
            fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date first = fmt.parse(start);
            Date last = fmt.parse((end == null || end.isEmpty()) ? new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()) : end);
            if (first == null || last == null) return prefs.getString("days", "0 ngày");
            long count = ((last.getTime() - first.getTime()) / 86400000L) + 1;
            return Math.max(0, count) + " ngày";
        } catch (Exception ignored) {
            return prefs.getString("days", "0 ngày");
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_streak_day);
        String accent = prefs.getString("accent", "#ED4D83");
        views.setTextViewText(R.id.widgetSymbol, prefs.getString("symbol", "♥"));
        views.setTextViewText(R.id.widgetNames, prefs.getString("name", "Streak Day"));
        views.setTextViewText(R.id.widgetDays, calculateDays(prefs));
        views.setTextColor(R.id.widgetSymbol, parseColor(accent));
        views.setTextColor(R.id.widgetDays, parseColor(accent));

        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pending = PendingIntent.getActivity(context, widgetId, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widgetRoot, pending);
        manager.updateAppWidget(widgetId, views);
    }

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) updateWidget(context, manager, id);
    }
}
