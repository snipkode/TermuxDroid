package com.myapp;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

/**
 * Main Activity - Entry point of the app
 */
public class MainActivity extends AppCompatActivity {

    private static final String TAG = "MainActivity";
    
    private TextView tvCounter;
    private TextView tvInfo;
    private Button btnIncrement;
    private Button btnDecrement;
    private Button btnReset;
    private Button btnShowInfo;
    
    private int counter = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        Log.d(TAG, "MainActivity onCreate");
        
        // Initialize views
        tvCounter = findViewById(R.id.tvCounter);
        tvInfo = findViewById(R.id.tvInfo);
        btnIncrement = findViewById(R.id.btnIncrement);
        btnDecrement = findViewById(R.id.btnDecrement);
        btnReset = findViewById(R.id.btnReset);
        btnShowInfo = findViewById(R.id.btnShowInfo);
        
        // Setup click listeners
        btnIncrement.setOnClickListener(v -> {
            counter++;
            updateCounter();
            Log.d(TAG, "Counter incremented: " + counter);
        });
        
        btnDecrement.setOnClickListener(v -> {
            counter--;
            updateCounter();
            Log.d(TAG, "Counter decremented: " + counter);
        });
        
        btnReset.setOnClickListener(v -> {
            counter = 0;
            updateCounter();
            Toast.makeText(this, "Counter reset", Toast.LENGTH_SHORT).show();
            Log.d(TAG, "Counter reset");
        });
        
        btnShowInfo.setOnClickListener(v -> {
            showDeviceInfo();
        });
        
        // Initialize counter display
        updateCounter();
    }
    
    private void updateCounter() {
        tvCounter.setText(String.valueOf(counter));
    }
    
    private void showDeviceInfo() {
        String info = "Android Version: " + android.os.Build.VERSION.RELEASE + "\n" +
                     "Model: " + android.os.Build.MODEL + "\n" +
                     "SDK: " + android.os.Build.VERSION.SDK_INT + "\n" +
                     "App Version: " + BuildConfig.VERSION_NAME;
        
        tvInfo.setText(info);
        Log.d(TAG, "Device info displayed");
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy");
    }
}
