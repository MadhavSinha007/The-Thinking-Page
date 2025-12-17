import React from 'react';
import { useSearchParams } from 'react-router-dom';
import BookList from '../../components/booklist';

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  return (
    <div className="w-full">
      <BookList searchQuery={searchQuery} />
    </div>
  );
};

export default Home;