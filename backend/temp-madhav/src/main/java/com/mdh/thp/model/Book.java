package com.mdh.thp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;


@Data // Generates Getters, Setters, toString
@Document(collection = "Books")
public class Book {
    @Id
    private String id;
    private String title;
    private String author;
    private int isbn;
    private String desc;
    private String genre;
    private String language;
    private String pubYear;
    private String cover;
    private String file;
}