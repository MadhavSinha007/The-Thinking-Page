import React, { useState, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import BookCard from './bookcard';

// BookSection Component
const BookSection = ({ title, books, viewAllLink }) => {
  if (!books || books.length === 0) return null;
  
  const displayBooks = books.slice(0, 7);
  
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
        {viewAllLink && (
          <button className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors group">
            View all
            <FiChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-5 pb-4">
          {displayBooks.map((book) => (
            <div key={book._id} className="flex-shrink-0 w-[180px]">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main BookList Component
const BookList = ({ searchQuery = "" }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const generateMockBooks = () => {
    return [
      {
        _id: "1",
        title: "101 cách của đồ đại lão hằng xóm",
        author: "Đồng Vũ",
        genre: "Romance",
        rating: "4.8",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1660145160i/62022434.jpg",
        desc: "Tống Thiên Thi luôn cảm thấy hàng xóm mới tới là người không dễ công chúng, bởi hắn không chỉ lạnh lùng mà lỡ nói ra chẳng để ưa lại còt. Mãi cho đến một hôm, khi cùa đến môi giới để đằm cảng anh, cô mới phải ở một trong những người trong những đối đối đối đối đắm 6 anh.",
        producer: "Updating",
        releaseStatus: "25/50",
        reviews: 1
      },
      {
        _id: "2",
        title: "Frankenstein; Or, The Modern Prometheus",
        author: "Mary Wollstonecraft Shelley",
        genre: "Gothic Fiction",
        rating: "4.6",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
        desc: "A young scientist creates a creature in an unorthodox scientific experiment.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 2847
      },
      {
        _id: "3",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Classic Fiction",
        rating: "4.8",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
        desc: "A gripping tale of racial injustice and childhood innocence in the Depression-era South.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 5234
      },
      {
        _id: "4",
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian",
        rating: "4.7",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
        desc: "A dystopian social science fiction novel and cautionary tale about totalitarianism.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 4521
      },
      {
        _id: "5",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "Romance",
        rating: "4.5",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
        desc: "A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 3892
      },
      {
        _id: "6",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Classic Fiction",
        rating: "4.4",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
        desc: "A critique of the American Dream set in the Jazz Age.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 4123
      },
      {
        _id: "7",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        genre: "Fantasy",
        rating: "4.9",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1598823299i/42844155.jpg",
        desc: "A young wizard's journey begins at Hogwarts School of Witchcraft and Wizardry.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 8234
      },
      {
        _id: "8",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        rating: "4.7",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
        desc: "A fantasy novel about the quest of home-loving hobbit Bilbo Baggins.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 3456
      },
      {
        _id: "9",
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        genre: "Classic Fiction",
        rating: "4.3",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
        desc: "A story about teenage rebellion and alienation.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 2789
      },
      {
        _id: "10",
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        rating: "4.9",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg",
        desc: "An epic high-fantasy novel about the quest to destroy the One Ring.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 9123
      },
      {
        _id: "11",
        title: "Animal Farm",
        author: "George Orwell",
        genre: "Political Fiction",
        rating: "4.6",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1424037542i/170448.jpg",
        desc: "A satirical allegorical novella about Stalinism.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 2934
      },
      {
        _id: "12",
        title: "Brave New World",
        author: "Aldous Huxley",
        genre: "Dystopian",
        rating: "4.5",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1575509280i/5129.jpg",
        desc: "A dystopian novel set in a futuristic World State of genetically modified citizens.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 3218
      },
      {
        _id: "13",
        title: "The Book Thief",
        author: "Markus Zusak",
        genre: "Historical Fiction",
        rating: "4.8",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522157426i/19063.jpg",
        desc: "A story about a young girl living with foster parents in Nazi Germany.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 4567
      },
      {
        _id: "14",
        title: "Jane Eyre",
        author: "Charlotte Brontë",
        genre: "Classic Fiction",
        rating: "4.6",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1557343311i/10210.jpg",
        desc: "A novel about the experiences of the eponymous character, including her growth to adulthood.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 3891
      }
    ];
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/books');
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      setBooks(data);
      setLoading(false);
    } catch (err) {
      console.log('Using mock data - backend not connected');
      const mockData = generateMockBooks();
      setBooks(mockData);
      setLoading(false);
    }
  };

  const getFilteredBooks = () => {
    if (!searchQuery.trim()) return books;
    
    const query = searchQuery.toLowerCase();
    return books.filter(book => 
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.genre?.toLowerCase().includes(query)
    );
  };

  const categorizeBooks = () => {
    const filtered = getFilteredBooks();
    
    if (searchQuery.trim()) {
      return { searchResults: filtered };
    }

    const latest = filtered.slice(0, 14);
    const recommended = filtered.filter(b => parseFloat(b.rating) >= 4.6);
    const exclusive = filtered.filter(b => b.genre === 'Romance' || b.genre === 'Fantasy');
    const highlyRated = filtered.filter(b => parseFloat(b.rating) >= 4.5).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    const favorite = filtered.slice(0, 14);

    return { latest, recommended, exclusive, highlyRated, favorite };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading amazing books...</p>
        </div>
      </div>
    );
  }

  const categories = categorizeBooks();

  return (
    <div className="w-full bg-white">
      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-10 px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search results for "<span className="text-purple-600">{searchQuery}</span>" 
            <span className="text-gray-500 text-lg ml-2">({categories.searchResults?.length || 0})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {categories.searchResults?.map((book) => (
              <div key={book._id} className="w-full">
                <BookCard book={book} />
              </div>
            ))}
          </div>
          {categories.searchResults?.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <p className="text-gray-600 text-lg">No books found matching your search</p>
              <p className="text-gray-500 text-sm mt-2">Try different keywords or browse our collections below</p>
            </div>
          )}
        </div>
      )}

      {/* Categorized Sections */}
      {!searchQuery.trim() && (
        <div className="px-6">
          <BookSection title="LATEST" books={categories.latest} viewAllLink={true} />
          <BookSection title="RECOMMENDED BOOKS" books={categories.recommended} viewAllLink={true} />
          <BookSection title="EXCLUSIVE BOOKS" books={categories.exclusive} viewAllLink={true} />
          <BookSection title="HIGHLY RATED BOOKS" books={categories.highlyRated} viewAllLink={true} />
          <BookSection title="FAVORITE BOOKS" books={categories.favorite} viewAllLink={true} />
        </div>
      )}
    </div>
  );
};

export default BookList;