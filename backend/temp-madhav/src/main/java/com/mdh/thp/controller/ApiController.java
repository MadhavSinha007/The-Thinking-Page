package com.mdh.thp.controller;

import com.mdh.thp.model.Book;
import com.mdh.thp.model.Com;
import com.mdh.thp.repository.BookRepository;
import com.mdh.thp.repository.ComRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ComRepository comRepository;

    // GET /api/books - Get all books
    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // GET /api/books/{id} - Get a specific book by ID
    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        Optional<Book> book = bookRepository.findById(id);
        return book.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /api/books - Create a new book
    @PostMapping("/books")
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }


    // GET /api/coms - Get all coms
    @GetMapping("/coms")
    public List<Com> getAllComs() {
        return comRepository.findAll();
    }

    // POST /api/coms - Create a new com
    @PostMapping("/coms")
    public Com createCom(@RequestBody Com com) {
        return comRepository.save(com);
    }
}

