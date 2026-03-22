package com.drachin;

import android.app.Application;
import android.util.Log;

/**
 * Application class for Drachin
 */
public class MyApplication extends Application {

    private static final String TAG = "MyApplication";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Drachin Application started");
    }
}
