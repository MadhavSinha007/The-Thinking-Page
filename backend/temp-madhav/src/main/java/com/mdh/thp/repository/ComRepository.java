package com.mdh.thp.repository;

import com.mdh.thp.model.Com;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ComRepository extends MongoRepository<Com, String> {
}