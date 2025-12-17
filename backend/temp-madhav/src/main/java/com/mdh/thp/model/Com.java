package com.mdh.thp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "coms")
public class Com {
    @Id
    private String id;
    private String message;
    private String sender;
}