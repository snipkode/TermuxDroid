package com.drachin.activity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.google.android.material.button.MaterialButton;
import com.drachin.R;
import com.drachin.adapter.VideoAdapter;
import com.drachin.model.Video;

import java.util.ArrayList;
import java.util.List;

/**
 * Video Detail Activity
 */
public class VideoDetailActivity extends AppCompatActivity {

    private static final String EXTRA_VIDEO = "extra_video";

    public static final String EXTRA_VIDEO_ID = "video_id";
    public static final String EXTRA_VIDEO_TITLE = "video_title";
    public static final String EXTRA_VIDEO_DESC = "video_desc";
    public static final String EXTRA_VIDEO_THUMBNAIL = "video_thumbnail";
    public static final String EXTRA_VIDEO_URL = "video_url";
    public static final String EXTRA_VIDEO_RATING = "video_rating";
    public static final String EXTRA_VIDEO_CATEGORY = "video_category";
    public static final String EXTRA_VIDEO_YEAR = "video_year";
    public static final String EXTRA_VIDEO_EPISODES = "video_episodes";

    private ImageView ivDetailThumbnail;
    private TextView tvDetailTitle;
    private TextView tvDetailRating;
    private TextView tvDetailYear;
    private TextView tvDetailCategory;
    private TextView tvDetailDescription;
    private MaterialButton btnPlay;
    private MaterialButton btnDownload;
    private ImageButton btnBack;
    private ImageButton btnFavorite;
    private RecyclerView rvEpisodes;

    private Video currentVideo;
    private List<Video> episodes;
    private VideoAdapter episodeAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video_detail);

        // Get video data from intent
        getVideoData();

        // Initialize views
        initViews();

        // Setup RecyclerView
        setupEpisodesRecyclerView();

        // Setup click listeners
        setupClickListeners();
    }

    private void getVideoData() {
        String id = getIntent().getStringExtra(EXTRA_VIDEO_ID);
        String title = getIntent().getStringExtra(EXTRA_VIDEO_TITLE);
        String description = getIntent().getStringExtra(EXTRA_VIDEO_DESC);
        String thumbnail = getIntent().getStringExtra(EXTRA_VIDEO_THUMBNAIL);
        String videoUrl = getIntent().getStringExtra(EXTRA_VIDEO_URL);
        String rating = getIntent().getStringExtra(EXTRA_VIDEO_RATING);
        String category = getIntent().getStringExtra(EXTRA_VIDEO_CATEGORY);
        int year = getIntent().getIntExtra(EXTRA_VIDEO_YEAR, 2024);

        currentVideo = new Video();
        currentVideo.setId(id);
        currentVideo.setTitle(title);
        currentVideo.setDescription(description);
        currentVideo.setThumbnailUrl(thumbnail);
        currentVideo.setVideoUrl(videoUrl);
        currentVideo.setRating(rating);
        currentVideo.setCategory(category);
        currentVideo.setYear(year);

        // Create sample episodes
        episodes = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Video episode = new Video();
            episode.setId("ep_" + i);
            episode.setTitle("Episode " + i);
            episode.setVideoUrl(videoUrl);
            episode.setDuration("45:00");
            episode.setRating(rating);
            episodes.add(episode);
        }
    }

    private void initViews() {
        ivDetailThumbnail = findViewById(R.id.ivDetailThumbnail);
        tvDetailTitle = findViewById(R.id.tvDetailTitle);
        tvDetailRating = findViewById(R.id.tvDetailRating);
        tvDetailYear = findViewById(R.id.tvDetailYear);
        tvDetailCategory = findViewById(R.id.tvDetailCategory);
        tvDetailDescription = findViewById(R.id.tvDetailDescription);
        btnPlay = findViewById(R.id.btnPlay);
        btnDownload = findViewById(R.id.btnDownload);
        btnBack = findViewById(R.id.btnBack);
        btnFavorite = findViewById(R.id.btnFavorite);
        rvEpisodes = findViewById(R.id.rvEpisodes);

        // Load thumbnail
        if (currentVideo.getThumbnailUrl() != null && !currentVideo.getThumbnailUrl().isEmpty()) {
            Glide.with(this)
                .load(currentVideo.getThumbnailUrl())
                .placeholder(R.drawable.placeholder_thumbnail)
                .error(R.drawable.placeholder_thumbnail)
                .centerCrop()
                .into(ivDetailThumbnail);
        }

        // Set data
        tvDetailTitle.setText(currentVideo.getTitle());
        tvDetailRating.setText("⭐ " + currentVideo.getRating());
        tvDetailYear.setText(String.valueOf(currentVideo.getYear()));
        tvDetailCategory.setText(currentVideo.getCategory());
        tvDetailDescription.setText(currentVideo.getDescription() != null ? 
            currentVideo.getDescription() : "No description available");
    }

    private void setupEpisodesRecyclerView() {
        rvEpisodes.setLayoutManager(new LinearLayoutManager(this));
        episodeAdapter = new VideoAdapter(this, episodes, new VideoAdapter.OnVideoClickListener() {
            @Override
            public void onVideoClick(Video video) {
                // Play episode
                playVideo(video);
            }

            @Override
            public void onFavoriteClick(Video video, int position) {
                Toast.makeText(VideoDetailActivity.this, 
                    (video.isFavorite() ? "Added to" : "Removed from") + " favorites", 
                    Toast.LENGTH_SHORT).show();
            }
        });
        rvEpisodes.setAdapter(episodeAdapter);
    }

    private void setupClickListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnPlay.setOnClickListener(v -> playVideo(currentVideo));

        btnDownload.setOnClickListener(v -> {
            Toast.makeText(this, "Download started", Toast.LENGTH_SHORT).show();
        });

        btnFavorite.setOnClickListener(v -> {
            currentVideo.setFavorite(!currentVideo.isFavorite());
            btnFavorite.setImageResource(currentVideo.isFavorite() ? 
                R.drawable.ic_favorite_filled : R.drawable.ic_favorite_outline);
            Toast.makeText(this, 
                currentVideo.isFavorite() ? "Added to favorites" : "Removed from favorites", 
                Toast.LENGTH_SHORT).show();
        });
    }

    private void playVideo(Video video) {
        Intent intent = new Intent(this, VideoPlayerActivity.class);
        intent.putExtra(VideoPlayerActivity.EXTRA_VIDEO_URL, video.getVideoUrl());
        intent.putExtra(VideoPlayerActivity.EXTRA_VIDEO_TITLE, video.getTitle());
        startActivity(intent);
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_out_right);
    }
}
