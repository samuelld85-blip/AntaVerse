package com.antaverse.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "AntaverseTimer",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class AntaverseTimerPlugin extends Plugin {
    private static final String CHANNEL_ID = "antaverse-timer";
    private static final int NOTIFICATION_ID = 4101;
    private static final int OPEN_TIMER_REQUEST = 4102;

    @PluginMethod
    public void start(PluginCall call) {
        Long endsAt = call.getLong("endsAt");
        if (endsAt == null || endsAt <= System.currentTimeMillis()) {
            call.reject("Le chronomètre doit se terminer dans le futur.");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
            && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
            return;
        }

        postTimer(call, endsAt);
    }

    @PermissionCallback
    public void notificationPermissionCallback(PluginCall call) {
        Long endsAt = call.getLong("endsAt");
        if (endsAt == null || endsAt <= System.currentTimeMillis()) {
            call.reject("Le chronomètre est arrivé à échéance.");
            return;
        }
        postTimer(call, endsAt);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        NotificationManager manager =
            (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.cancel(NOTIFICATION_ID);
        call.resolve();
    }

    private void postTimer(PluginCall call, long endsAt) {
        createChannel();
        String title = call.getString("title", "AntaVerse · Repos");
        String url = call.getString("url", "/sport/?section=training");
        Intent intent = new Intent(getContext(), MainActivity.class)
            .setAction("com.antaverse.app.OPEN_TIMER")
            .putExtra("url", url)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            getContext(),
            OPEN_TIMER_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        long remaining = Math.max(1_000L, endsAt - System.currentTimeMillis());
        Notification notification = new NotificationCompat.Builder(getContext(), CHANNEL_ID)
            .setSmallIcon(com.antaverse.app.R.mipmap.ic_launcher)
            .setColor(Color.rgb(124, 92, 255))
            .setContentTitle(title)
            .setContentText("Chronomètre en cours")
            .setContentIntent(contentIntent)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setShowWhen(true)
            .setWhen(endsAt)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setTimeoutAfter(remaining)
            .build();

        NotificationManager manager =
            (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(NOTIFICATION_ID, notification);

        JSObject result = new JSObject();
        result.put("supported", true);
        result.put("notificationsEnabled", manager != null && manager.areNotificationsEnabled());
        call.resolve(result);
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager =
            (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Chronomètres",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Chronomètres de repos AntaVerse");
        channel.setShowBadge(false);
        manager.createNotificationChannel(channel);
    }
}
