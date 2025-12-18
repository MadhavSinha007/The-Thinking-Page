package com.mdh.thp.repository;

import com.mdh.thp.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByFirebaseUid(String firebaseUid);

    boolean existsByFirebaseUid(String firebaseUid);

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);
}
