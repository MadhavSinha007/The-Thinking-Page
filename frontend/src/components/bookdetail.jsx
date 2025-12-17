import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiHeart, FiShare2 } from 'react-icons/fi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/books/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }
      
      const data = await response.json();
      setBook(data);
      setLoading(false);
    } catch (err) {
      console.log('Using mock data - backend not connected');
      const mockBook = getMockBookById(id);
      setBook(mockBook);
      setLoading(false);
    }
  };

  const getMockBookById = (bookId) => {
    const mockBooks = {
      "1": {
        _id: "1",
        title: "101 cách của đồ đại lão hằng xóm",
        author: "Đồng Vũ",
        genre: "Romance",
        rating: "4",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1660145160i/62022434.jpg",
        desc: "Tống Thiên Thi luôn cảm thấy hàng xóm mới tới là người không dễ công chúng, bởi hắn không chỉ lạnh lùng mà lỡ nói ra chẳng để ưa lại còt. Mãi cho đến một hôm, khi cùa đến môi giới để đằm cảng anh, cô mới phải ở một trong những người trong những đối đối đối đối đắm 6 anh.\n\nĐôi mắt của tuổi từ Ẩn sang cuốc: 'Trăm nhân đế có quả, tài chính là quả của em.'\nTống Thiên Thi người đỡn ống và mặc chính là trước một, đồt nhiên thậy đối được điềm 6 anh.\n\nCó cho rằng...View more",
        producer: "Updating",
        releaseStatus: "25/50",
        reviews: 1,
        language: "vie"
      },
      "2": {
        _id: "2",
        title: "Frankenstein; Or, The Modern Prometheus",
        author: "Mary Wollstonecraft Shelley",
        genre: "Gothic Fiction",
        rating: "4.6",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
        desc: "Frankenstein; or, The Modern Prometheus is an 1818 novel written by English author Mary Shelley. Frankenstein tells the story of Victor Frankenstein, a young scientist who creates a sapient creature in an unorthodox scientific experiment. Shelley started writing the story when she was 18, and the first edition was published anonymously in London on 1 January 1818, when she was 20. Her name first appeared in the second edition, which was published in Paris in 1821.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 2847,
        language: "eng"
      },
      "3": {
        _id: "3",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Classic Fiction",
        rating: "4.8",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
        desc: "A gripping tale of racial injustice and childhood innocence in the Depression-era South.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 5234,
        language: "eng"
      },
      "4": {
        _id: "4",
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian",
        rating: "4.7",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
        desc: "A dystopian social science fiction novel and cautionary tale about totalitarianism.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 4521,
        language: "eng"
      },
      "7": {
        _id: "7",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        genre: "Fantasy",
        rating: "4.9",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1598823299i/42844155.jpg",
        desc: "A young wizard's journey begins at Hogwarts School of Witchcraft and Wizardry.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 8234,
        language: "eng"
      },
      "8": {
        _id: "8",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        rating: "4.7",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
        desc: "A fantasy novel about the quest of home-loving hobbit Bilbo Baggins.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 3456,
        language: "eng"
      },
      "10": {
        _id: "10",
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        rating: "4.9",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg",
        desc: "An epic high-fantasy novel about the quest to destroy the One Ring.",
        producer: "Completed",
        releaseStatus: "Complete",
        reviews: 9123,
        language: "eng"
      }
    };
    
    return mockBooks[bookId] || mockBooks["1"];
  };

  const handleReadNow = () => {
    console.log('Read now clicked for book:', book._id);
    // TODO: Add your read logic here
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Add your save logic here
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Add your like logic here
  };

  const handleShare = () => {
    console.log('Share clicked');
    // TODO: Add your share logic here
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>);
      } else if (i - 0.5 <= numRating) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">⯨</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 text-xl">★</span>);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Book not found</p>
          <button 
            onClick={() => navigate('/home')}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-10 p-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:text-gray-900 font-medium transition-colors"
      >
        <FiArrowLeft size={20} />
        Back
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Book Header Section */}
          <div className="flex flex-col md:flex-row gap-8 p-8">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <img 
                src={book.cover || "https://via.placeholder.com/300x450?text=No+Cover"}
                alt={book.title}
                className="w-64 h-96 object-cover rounded-xl shadow-2xl"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x450?text=No+Cover";
                }}
              />
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {book.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {renderStars(book.rating)}
                </div>
                <span className="text-gray-600 font-medium">{book.rating}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{book.reviews || 1} Review{book.reviews !== 1 ? 's' : ''}</span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 rounded-xl p-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Author</p>
                  <p className="text-base font-semibold text-gray-900">{book.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Genre</p>
                  <p className="text-base font-semibold text-gray-900">{book.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Producer</p>
                  <p className="text-base font-semibold text-gray-900">{book.producer || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Release status</p>
                  <p className="text-base font-semibold text-gray-900">{book.releaseStatus || 'N/A'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button 
                  onClick={handleReadNow}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <FiBookOpen size={20} />
                  Read
                </button>
                
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isSaved ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
                </button>
                
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${isLiked ? 'bg-red-50 text-red-600 border-red-300' : 'bg-white text-gray-700 border-gray-300'} hover:bg-gray-50 border-2 px-6 py-3 rounded-lg font-semibold transition-colors`}
                >
                  <FiHeart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <FiShare2 size={20} />
                </button>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <p className={`text-gray-700 leading-relaxed ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                  {book.desc}
                </p>
                {book.desc && book.desc.length > 200 && (
                  <button 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-blue-500 hover:text-blue-600 font-medium mt-2"
                  >
                    {showFullDesc ? 'View less' : 'View more'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section - Placeholder */}
          <div className="border-t px-8 py-6 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Comment ({book.reviews || 0})
            </h3>
            <div className="text-center py-8 text-gray-500">
              <p>Comments section coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;