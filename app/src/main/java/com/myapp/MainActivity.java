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
            animateCounter();
            Log.d(TAG, "Counter incremented: " + counter);
        });

        btnDecrement.setOnClickListener(v -> {
            counter--;
            updateCounter();
            animateCounter();
            Log.d(TAG, "Counter decremented: " + counter);
        });

        btnReset.setOnClickListener(v -> {
            counter = 0;
            updateCounter();
            tvCounter.setScaleX(1.5f);
            tvCounter.setScaleY(1.5f);
            tvCounter.animate()
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(300)
                .start();
            Toast.makeText(this, "✓ Counter diulang", Toast.LENGTH_SHORT).show();
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

    private void animateCounter() {
        tvCounter.animate()
            .scaleX(1.2f)
            .scaleY(1.2f)
            .setDuration(100)
            .withEndAction(() -> tvCounter.animate()
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(100)
                .start())
            .start();
    }

    private void showDeviceInfo() {
        String info = "⚡ Versi Android: " + android.os.Build.VERSION.RELEASE + "\n" +
                     "📱 Model: " + android.os.Build.MODEL + "\n" +
                     "🔧 SDK: " + android.os.Build.VERSION.SDK_INT + "\n" +
                     "🏭 Pabrikan: " + android.os.Build.MANUFACTURER + "\n" +
                     "📲 Merek: " + android.os.Build.BRAND + "\n" +
                     "📐 Layar: " + getResources().getDisplayMetrics().widthPixels + "x" + 
                     getResources().getDisplayMetrics().heightPixels + "\n" +
                     "📦 Versi App: " + BuildConfig.VERSION_NAME;

        tvInfo.setText(info);
        
        // Animate info card
        tvInfo.setAlpha(0f);
        tvInfo.setScaleY(0.8f);
        tvInfo.animate()
            .alpha(1f)
            .scaleY(1f)
            .setDuration(300)
            .start();
            
        Toast.makeText(this, "✓ Info device ditampilkan", Toast.LENGTH_SHORT).show();
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
