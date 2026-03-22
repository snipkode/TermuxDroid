package com.drachin.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.drachin.R;
import com.drachin.model.Video;

import java.util.List;

/**
 * Adapter for Video/Drama list in RecyclerView
 */
public class VideoAdapter extends RecyclerView.Adapter<VideoAdapter.VideoViewHolder> {

    private Context context;
    private List<Video> videoList;
    private OnVideoClickListener listener;

    public interface OnVideoClickListener {
        void onVideoClick(Video video);
        void onFavoriteClick(Video video, int position);
    }

    public VideoAdapter(Context context, List<Video> videoList, OnVideoClickListener listener) {
        this.context = context;
        this.videoList = videoList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public VideoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_video, parent, false);
        return new VideoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VideoViewHolder holder, int position) {
        Video video = videoList.get(position);
        holder.bind(video, position);
    }

    @Override
    public int getItemCount() {
        return videoList != null ? videoList.size() : 0;
    }

    public void updateList(List<Video> newVideoList) {
        videoList = newVideoList;
        notifyDataSetChanged();
    }

    class VideoViewHolder extends RecyclerView.ViewHolder {
        ImageView ivThumbnail;
        TextView tvTitle;
        TextView tvCategory;
        TextView tvRating;
        TextView tvDuration;
        ImageView ivFavorite;
        View favoriteButton;

        public VideoViewHolder(@NonNull View itemView) {
            super(itemView);
            ivThumbnail = itemView.findViewById(R.id.ivThumbnail);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvRating = itemView.findViewById(R.id.tvRating);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            ivFavorite = itemView.findViewById(R.id.ivFavorite);
            favoriteButton = itemView.findViewById(R.id.favoriteButton);
        }

        public void bind(Video video, int position) {
            tvTitle.setText(video.getTitle());
            tvCategory.setText(video.getCategory());
            tvRating.setText("⭐ " + video.getRating());
            tvDuration.setText(video.getDuration());

            // Load thumbnail using Glide
            if (video.getThumbnailUrl() != null && !video.getThumbnailUrl().isEmpty()) {
                Glide.with(context)
                    .load(video.getThumbnailUrl())
                    .placeholder(R.drawable.placeholder_thumbnail)
                    .error(R.drawable.placeholder_thumbnail)
                    .centerCrop()
                    .into(ivThumbnail);
            } else {
                ivThumbnail.setImageResource(R.drawable.placeholder_thumbnail);
            }

            // Favorite icon
            ivFavorite.setImageResource(video.isFavorite() ? 
                R.drawable.ic_favorite_filled : R.drawable.ic_favorite_outline);

            // Click listeners
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onVideoClick(video);
                }
            });

            favoriteButton.setOnClickListener(v -> {
                if (listener != null) {
                    video.setFavorite(!video.isFavorite());
                    notifyItemChanged(position);
                    listener.onFavoriteClick(video, position);
                }
            });
        }
    }
}
