package com.drachin.model;

import java.io.Serializable;

/**
 * Model class for Category
 */
public class Category implements Serializable {
    private String id;
    private String name;
    private String imageUrl;
    private int videoCount;

    public Category() {
    }

    public Category(String id, String name, String imageUrl) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
    }

    public Category(String id, String name, int videoCount) {
        this.id = id;
        this.name = name;
        this.videoCount = videoCount;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getVideoCount() {
        return videoCount;
    }

    public void setVideoCount(int videoCount) {
        this.videoCount = videoCount;
    }
}
