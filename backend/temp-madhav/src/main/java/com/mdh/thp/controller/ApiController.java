package com.mdh.thp.controller;

import com.mdh.thp.model.Book;
import com.mdh.thp.model.Com;
import com.mdh.thp.model.User;
import com.mdh.thp.repository.BookRepository;
import com.mdh.thp.repository.ComRepository;
import com.mdh.thp.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ComRepository comRepository;

    @Autowired
    private UserRepository userRepository;

    // ================= BOOKS =================

    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/books")
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    // ================= COMMENTS =================

    @GetMapping("/coms")
    public List<Com> getAllComs() {
        return comRepository.findAll();
    }

    @GetMapping("/coms/book/{bookid}")
    public List<Com> getComsByBookId(@PathVariable String bookid) {
        return comRepository.findByBookid(bookid);
    }

    @PostMapping("/coms")
    public Com createCom(@RequestBody Com com) {
        return comRepository.save(com);
    }

    // ================= USERS =================

    /**
     * Create user OR return existing user
     * Used after Firebase login
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // 🔒 Validate required fields
            if (user.getFirebaseUid() == null || user.getFirebaseUid().isBlank()) {
                return ResponseEntity.badRequest().body("firebaseUid is required");
            }

            if (user.getUsername() == null || user.getUsername().isBlank()) {
                return ResponseEntity.badRequest().body("username is required");
            }

            // 🔁 Return existing user if already created
            Optional<User> existingUser =
                    userRepository.findByFirebaseUid(user.getFirebaseUid());

            if (existingUser.isPresent()) {
                return ResponseEntity.ok(existingUser.get());
            }

            // 🔐 Username uniqueness
            if (userRepository.existsByUsername(user.getUsername())) {
                return ResponseEntity.badRequest().body("Username already taken");
            }

            return ResponseEntity.ok(userRepository.save(user));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error creating user: " + e.getMessage());
        }
    }

    /**
     * Get user by Firebase UID
     */
    @GetMapping("/users/firebase/{firebaseUid}")
    public ResponseEntity<User> getUserByFirebaseUid(
            @PathVariable String firebaseUid) {

        return userRepository.findByFirebaseUid(firebaseUid)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update username
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUsername(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {

        try {
            String newUsername = body.get("username");

            if (newUsername == null || newUsername.isBlank()) {
                return ResponseEntity.badRequest().body("Username cannot be empty");
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Optional<User> existingUser =
                    userRepository.findByUsername(newUsername);

            if (existingUser.isPresent()
                    && !existingUser.get().getId().equals(userId)) {
                return ResponseEntity.badRequest().body("Username already taken");
            }

            User user = userOpt.get();
            user.setUsername(newUsername);

            return ResponseEntity.ok(userRepository.save(user));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error updating username: " + e.getMessage());
        }
    }

    /**
     * Delete user
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.notFound().build();
            }

            userRepository.deleteById(userId);
            return ResponseEntity.ok("User deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error deleting user: " + e.getMessage());
        }
    }

    // ================= FAVORITE BOOKS =================

    /**
     * Get favorite books of a user
     */
    @GetMapping("/users/{userId}/favbooks")
    public ResponseEntity<List<Book>> getFavBooks(
            @PathVariable String userId) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        List<Book> favBooks =
                bookRepository.findAllById(user.getFavBooks());

        return ResponseEntity.ok(favBooks);
    }

    /**
     * Add book to favorites
     */
    @PostMapping("/users/{userId}/favbooks/{bookId}")
    public ResponseEntity<User> addFavBook(
            @PathVariable String userId,
            @PathVariable String bookId) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (!user.getFavBooks().contains(bookId)) {
            user.getFavBooks().add(bookId);
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Remove book from favorites
     */
    @DeleteMapping("/users/{userId}/favbooks/{bookId}")
    public ResponseEntity<User> removeFavBook(
            @PathVariable String userId,
            @PathVariable String bookId) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.getFavBooks().removeIf(id -> id.equals(bookId));

        return ResponseEntity.ok(userRepository.save(user));
    }
}
