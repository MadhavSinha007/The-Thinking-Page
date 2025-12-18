package com.mdh.thp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "Comments")
public class Com {
    @Id
    private String bookid;
    private String text;
    private String user;
}