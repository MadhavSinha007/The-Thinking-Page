package com.mdh.thp; // Match your package name

import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class ConnTest {

    @Bean
    public CommandLineRunner testConnection(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                // Send a 'ping' command to the database
                mongoTemplate.getDb().runCommand(new Document("ping", 1));
                
                System.out.println("----------------------------------------");
                System.out.println("✅ SUCCESS: Connected to MongoDB Atlas!");
                System.out.println("----------------------------------------");
                
            } catch (Exception e) {
                System.err.println("----------------------------------------");
                System.err.println("❌ FAILED: Could not connect to MongoDB Atlas.");
                System.err.println("Error: " + e.getMessage());
                System.err.println("----------------------------------------");
            }
        };
    }
}