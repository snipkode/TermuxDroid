package com.drachin;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.drachin.activity.VideoDetailActivity;
import com.drachin.activity.VideoPlayerActivity;
import com.drachin.adapter.CategoryAdapter;
import com.drachin.adapter.VideoAdapter;
import com.drachin.model.Category;
import com.drachin.model.Video;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;

import java.util.ArrayList;
import java.util.List;

/**
 * Main Activity - Entry point of Drachin app
 */
public class MainActivity extends AppCompatActivity {

    // Views
    private ImageButton btnSearch;
    private ImageButton btnNotification;
    private MaterialCardView searchBar;
    private EditText etSearch;
    private ImageButton btnClearSearch;

    private ImageView ivFeatured;
    private TextView tvFeaturedTitle;
    private TextView tvFeaturedDesc;
    private MaterialButton btnWatchNow;

    private RecyclerView rvCategories;
    private RecyclerView rvTrending;
    private RecyclerView rvContinueWatching;
    private RecyclerView rvNewReleases;

    private BottomNavigationView bottomNavigation;

    // Adapters
    private CategoryAdapter categoryAdapter;
    private VideoAdapter trendingAdapter;
    private VideoAdapter continueWatchingAdapter;
    private VideoAdapter newReleasesAdapter;

    // Data
    private List<Category> categories;
    private List<Video> trendingVideos;
    private List<Video> continueWatching;
    private List<Video> newReleases;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize data
        initData();

        // Initialize views
        initViews();

        // Setup RecyclerViews
        setupRecyclerViews();

        // Setup click listeners
        setupClickListeners();

        // Load featured content
        loadFeaturedContent();
    }

    private void initData() {
        // Sample categories
        categories = new ArrayList<>();
        categories.add(new Category("1", "Romance", 120));
        categories.add(new Category("2", "Action", 85));
        categories.add(new Category("3", "Comedy", 95));
        categories.add(new Category("4", "Thriller", 60));
        categories.add(new Category("5", "Fantasy", 75));
        categories.add(new Category("6", "Historical", 45));

        // Sample trending videos
        trendingVideos = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Video video = new Video();
            video.setId("trending_" + i);
            video.setTitle("Drama Title " + i);
            video.setDescription("An amazing drama series that will captivate your heart");
            video.setThumbnailUrl("");
            video.setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
            video.setDuration("45:00");
            video.setRating(String.valueOf(8.5 + (i % 5) / 10.0));
            video.setCategory("Romance");
            video.setYear(2024);
            video.setFavorite(i % 3 == 0);
            trendingVideos.add(video);
        }

        // Sample continue watching
        continueWatching = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Video video = new Video();
            video.setId("continue_" + i);
            video.setTitle("Continue Drama " + i);
            video.setDescription("Continue watching where you left off");
            video.setThumbnailUrl("");
            video.setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
            video.setDuration("45:00");
            video.setRating(String.valueOf(8.0 + (i % 4) / 10.0));
            video.setCategory("Action");
            video.setYear(2024);
            video.setLastWatchedPosition(i * 300000); // milliseconds
            continueWatching.add(video);
        }

        // Sample new releases
        newReleases = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Video video = new Video();
            video.setId("new_" + i);
            video.setTitle("New Release " + i);
            video.setDescription("Brand new drama just released");
            video.setThumbnailUrl("");
            video.setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
            video.setDuration("45:00");
            video.setRating(String.valueOf(7.5 + (i % 6) / 10.0));
            video.setCategory("Comedy");
            video.setYear(2024);
            newReleases.add(video);
        }
    }

    private void initViews() {
        // Search
        btnSearch = findViewById(R.id.btnSearch);
        btnNotification = findViewById(R.id.btnNotification);
        searchBar = findViewById(R.id.searchBar);
        etSearch = findViewById(R.id.etSearch);
        btnClearSearch = findViewById(R.id.btnClearSearch);

        // Featured
        ivFeatured = findViewById(R.id.ivFeatured);
        tvFeaturedTitle = findViewById(R.id.tvFeaturedTitle);
        tvFeaturedDesc = findViewById(R.id.tvFeaturedDesc);
        btnWatchNow = findViewById(R.id.btnWatchNow);

        // RecyclerViews
        rvCategories = findViewById(R.id.rvCategories);
        rvTrending = findViewById(R.id.rvTrending);
        rvContinueWatching = findViewById(R.id.rvContinueWatching);
        rvNewReleases = findViewById(R.id.rvNewReleases);

        // Bottom Navigation
        bottomNavigation = findViewById(R.id.bottomNavigation);
    }

    private void setupRecyclerViews() {
        // Categories
        rvCategories.setLayoutManager(new LinearLayoutManager(this, 
            LinearLayoutManager.HORIZONTAL, false));
        categoryAdapter = new CategoryAdapter(this, categories, this::onCategoryClick);
        rvCategories.setAdapter(categoryAdapter);

        // Trending
        rvTrending.setLayoutManager(new LinearLayoutManager(this, 
            LinearLayoutManager.HORIZONTAL, false));
        trendingAdapter = new VideoAdapter(this, trendingVideos, new VideoAdapter.OnVideoClickListener() {
            @Override
            public void onVideoClick(Video video) {
                openVideoDetail(video);
            }

            @Override
            public void onFavoriteClick(Video video, int position) {
                Toast.makeText(MainActivity.this, 
                    (video.isFavorite() ? "Added to" : "Removed from") + " favorites", 
                    Toast.LENGTH_SHORT).show();
            }
        });
        rvTrending.setAdapter(trendingAdapter);

        // Continue Watching
        rvContinueWatching.setLayoutManager(new LinearLayoutManager(this, 
            LinearLayoutManager.HORIZONTAL, false));
        continueWatchingAdapter = new VideoAdapter(this, continueWatching, new VideoAdapter.OnVideoClickListener() {
            @Override
            public void onVideoClick(Video video) {
                playVideo(video);
            }

            @Override
            public void onFavoriteClick(Video video, int position) {
                Toast.makeText(MainActivity.this, 
                    (video.isFavorite() ? "Added to" : "Removed from") + " favorites", 
                    Toast.LENGTH_SHORT).show();
            }
        });
        rvContinueWatching.setAdapter(continueWatchingAdapter);

        // New Releases
        rvNewReleases.setLayoutManager(new LinearLayoutManager(this, 
            LinearLayoutManager.HORIZONTAL, false));
        newReleasesAdapter = new VideoAdapter(this, newReleases, new VideoAdapter.OnVideoClickListener() {
            @Override
            public void onVideoClick(Video video) {
                openVideoDetail(video);
            }

            @Override
            public void onFavoriteClick(Video video, int position) {
                Toast.makeText(MainActivity.this, 
                    (video.isFavorite() ? "Added to" : "Removed from") + " favorites", 
                    Toast.LENGTH_SHORT).show();
            }
        });
        rvNewReleases.setAdapter(newReleasesAdapter);
    }

    private void setupClickListeners() {
        // Search
        btnSearch.setOnClickListener(v -> {
            searchBar.setVisibility(searchBar.getVisibility() == View.VISIBLE ? 
                View.GONE : View.VISIBLE);
            if (searchBar.getVisibility() == View.VISIBLE) {
                etSearch.requestFocus();
            }
        });

        btnClearSearch.setOnClickListener(v -> etSearch.setText(""));

        // Notification
        btnNotification.setOnClickListener(v -> 
            Toast.makeText(this, "Notifications", Toast.LENGTH_SHORT).show());

        // Featured
        btnWatchNow.setOnClickListener(v -> {
            if (!trendingVideos.isEmpty()) {
                openVideoDetail(trendingVideos.get(0));
            }
        });

        // See All buttons
        findViewById(R.id.tvSeeAllCategories).setOnClickListener(v -> 
            Toast.makeText(this, "View all categories", Toast.LENGTH_SHORT).show());

        findViewById(R.id.tvSeeAllTrending).setOnClickListener(v -> 
            Toast.makeText(this, "View all trending", Toast.LENGTH_SHORT).show());

        findViewById(R.id.tvSeeAllContinue).setOnClickListener(v -> 
            Toast.makeText(this, "View continue watching", Toast.LENGTH_SHORT).show());

        findViewById(R.id.tvSeeAllNew).setOnClickListener(v -> 
            Toast.makeText(this, "View all new releases", Toast.LENGTH_SHORT).show());

        // Bottom Navigation
        bottomNavigation.setSelectedItemId(R.id.nav_home);
        bottomNavigation.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                return true;
            } else if (itemId == R.id.nav_search) {
                searchBar.setVisibility(View.VISIBLE);
                etSearch.requestFocus();
                return true;
            } else if (itemId == R.id.nav_downloads) {
                Toast.makeText(this, "Downloads", Toast.LENGTH_SHORT).show();
                return true;
            } else if (itemId == R.id.nav_favorites) {
                Toast.makeText(this, "Favorites", Toast.LENGTH_SHORT).show();
                return true;
            } else if (itemId == R.id.nav_profile) {
                Toast.makeText(this, "Profile", Toast.LENGTH_SHORT).show();
                return true;
            }
            return false;
        });
    }

    private void loadFeaturedContent() {
        // Load featured image and content
        String featuredImageUrl = "";
        if (!featuredImageUrl.isEmpty()) {
            Glide.with(this)
                .load(featuredImageUrl)
                .placeholder(R.drawable.placeholder_featured)
                .error(R.drawable.placeholder_featured)
                .centerCrop()
                .into(ivFeatured);
        } else {
            ivFeatured.setImageResource(R.drawable.placeholder_featured);
        }

        tvFeaturedTitle.setText("🎬 Featured Drama");
        tvFeaturedDesc.setText("Watch the latest and most popular dramas");
    }

    private void onCategoryClick(Category category) {
        Toast.makeText(this, "Category: " + category.getName(), Toast.LENGTH_SHORT).show();
    }

    private void openVideoDetail(Video video) {
        Intent intent = new Intent(this, VideoDetailActivity.class);
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_ID, video.getId());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_TITLE, video.getTitle());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_DESC, video.getDescription());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_THUMBNAIL, video.getThumbnailUrl());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_URL, video.getVideoUrl());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_RATING, video.getRating());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_CATEGORY, video.getCategory());
        intent.putExtra(VideoDetailActivity.EXTRA_VIDEO_YEAR, video.getYear());
        startActivity(intent);
        overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_out_right);
    }

    private void playVideo(Video video) {
        Intent intent = new Intent(this, VideoPlayerActivity.class);
        intent.putExtra(VideoPlayerActivity.EXTRA_VIDEO_URL, video.getVideoUrl());
        intent.putExtra(VideoPlayerActivity.EXTRA_VIDEO_TITLE, video.getTitle());
        startActivity(intent);
    }

    @Override
    public void onBackPressed() {
        if (searchBar.getVisibility() == View.VISIBLE) {
            searchBar.setVisibility(View.GONE);
        } else {
            super.onBackPressed();
        }
    }
}
