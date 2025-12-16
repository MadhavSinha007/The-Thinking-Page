import React from "react";
import BookCard from "./bookcard";

const BookList = ({ title, books }) => {
  return (
    <section className="my-6">
      {/* Section Title */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        {title}
      </h2>

      {/* Scrollable Book List */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        {books.map((book, index) => (
          <BookCard
            key={index}
            image={book.image}
            title={book.title}
            author={book.author}
          />
        ))}
      </div>
    </section>
  );
};

export default BookList;
