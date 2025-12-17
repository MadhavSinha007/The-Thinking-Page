package com.mdh.thp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;



@SpringBootApplication
public class ThpApplication {

	public static void main(String[] args) {
		SpringApplication.run(ThpApplication.class, args);
	}

    @Value("${spring.data.mongodb.uri:NOT_FOUND}")
    private String mongoUri;

    @Bean
    public CommandLineRunner printConfig() {
        return args -> {
            System.out.println("========================================");
            System.out.println("READING CONFIG: " + mongoUri);
            System.out.println("========================================");
        };
    }

    @Bean
    public CommandLineRunner debugMongoConnection(MongoTemplate mongoTemplate) {
        return args -> {
            System.out.println("----------------------------------------");
            System.out.println("CONNECTED DATABASE: " + mongoTemplate.getDb().getName());
            System.out.println("COLLECTIONS FOUND: " + mongoTemplate.getCollectionNames());
            System.out.println("----------------------------------------");
        };
    }
    

}