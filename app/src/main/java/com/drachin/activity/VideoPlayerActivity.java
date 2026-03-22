package com.drachin.activity;

import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.MediaController;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.VideoView;

import androidx.appcompat.app.AppCompatActivity;

import com.drachin.R;
import com.drachin.model.Video;

/**
 * Video Player Activity
 */
public class VideoPlayerActivity extends AppCompatActivity {

    private static final String TAG = "VideoPlayerActivity";
    private static final String EXTRA_VIDEO = "extra_video";

    public static final String EXTRA_VIDEO_URL = "video_url";
    public static final String EXTRA_VIDEO_TITLE = "video_title";

    private VideoView videoView;
    private ProgressBar progressBar;
    private TextView tvError;
    private ImageButton btnBack;

    private String videoUrl;
    private String videoTitle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video_player);

        // Get video data from intent
        if (getIntent().hasExtra(EXTRA_VIDEO_URL)) {
            videoUrl = getIntent().getStringExtra(EXTRA_VIDEO_URL);
            videoTitle = getIntent().getStringExtra(EXTRA_VIDEO_TITLE);
        }

        // Initialize views
        videoView = findViewById(R.id.videoView);
        progressBar = findViewById(R.id.progressBar);
        tvError = findViewById(R.id.tvError);
        btnBack = findViewById(R.id.btnBack);

        // Setup back button
        btnBack.setOnClickListener(v -> finish());

        // Setup video player
        setupPlayer();
    }

    private void setupPlayer() {
        if (videoUrl == null || videoUrl.isEmpty()) {
            tvError.setVisibility(View.VISIBLE);
            tvError.setText("No video URL provided");
            return;
        }

        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        tvError.setVisibility(View.GONE);

        // Set video URI
        try {
            Uri videoUri = Uri.parse(videoUrl);
            videoView.setVideoURI(videoUri);

            // Add media controller
            MediaController mediaController = new MediaController(this);
            mediaController.setAnchorView(videoView);
            videoView.setMediaController(mediaController);

            // Set listeners
            videoView.setOnPreparedListener(mp -> {
                progressBar.setVisibility(View.GONE);
                videoView.start();
                Log.d(TAG, "Video started: " + videoTitle);
            });

            videoView.setOnCompletionListener(mp -> {
                Log.d(TAG, "Video completed");
                finish();
            });

            videoView.setOnErrorListener((mp, what, extra) -> {
                progressBar.setVisibility(View.GONE);
                tvError.setVisibility(View.VISIBLE);
                tvError.setText("Error playing video");
                Log.e(TAG, "Video error: " + what + ", " + extra);
                return true;
            });

        } catch (Exception e) {
            progressBar.setVisibility(View.GONE);
            tvError.setVisibility(View.VISIBLE);
            tvError.setText("Invalid video URL");
            Log.e(TAG, "Error setting up video player", e);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (videoView != null && videoView.isPlaying()) {
            videoView.pause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (videoView != null) {
            videoView.stopPlayback();
        }
    }
}
