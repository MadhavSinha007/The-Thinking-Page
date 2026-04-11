import React from "react";
import { useOutletContext } from "react-router-dom";
import BookList from "../../components/booklist";

const Home = () => {
  const { searchQuery = "", darkMode = false } = useOutletContext();
  
  return <BookList searchQuery={searchQuery} darkMode={darkMode} />;
};

export default Home;