package com.mdh.thp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "Users")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

    @Id
    private String id;

    // ✅ sparse avoids duplicate null crash
    @Indexed(unique = true, sparse = true)
    private String firebaseUid;

    @Indexed(unique = true)
    private String username;

    private String email;

    // ✅ Always initialized (never null)
    private List<String> favBooks = new ArrayList<>();

    // ===== Constructors =====
    public User() {
        this.favBooks = new ArrayList<>();
    }

    public User(String firebaseUid, String username, String email) {
        this.firebaseUid = firebaseUid;
        this.username = username;
        this.email = email;
        this.favBooks = new ArrayList<>();
    }

    // ===== Getters & Setters =====

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getFavBooks() {
        // ✅ Extra safety
        if (favBooks == null) {
            favBooks = new ArrayList<>();
        }
        return favBooks;
    }

    public void setFavBooks(List<String> favBooks) {
        this.favBooks = (favBooks != null) ? favBooks : new ArrayList<>();
    }
}
