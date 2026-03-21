package com.myapp;

import android.app.Application;
import android.util.Log;

/**
 * Application class - initialized when app starts
 */
public class MyApplication extends Application {

    private static final String TAG = "MyApplication";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Application onCreate");
        
        // Initialize global app components here
        // - Database
        // - Network clients
        // - Analytics
        // - Dependency injection
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
        Log.d(TAG, "Application onTerminate");
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        Log.d(TAG, "Application onLowMemory");
    }
}
