import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import KindleReader from "../../components/KindleReader/KindleReader";

const BookReaderPage = () => {
  const { id } = useParams();
  const mainContainerRef = useRef(null);

  const [bookUrl, setBookUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mainElement = document.querySelector("main.flex-1.overflow-y-auto");
    if (mainElement) {
      mainContainerRef.current = mainElement;
      const originalOverflow = mainElement.style.overflow;
      const originalHeight = mainElement.style.height;

      mainElement.style.overflow = "hidden";
      mainElement.style.height = "100%";

      return () => {
        mainElement.style.overflow = originalOverflow;
        mainElement.style.height = originalHeight;
      };
    }
  }, []);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await fetch(`http://localhost:8090/api/books/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const url = data?.file;

        if (!url) throw new Error("No file URL in response");
        setBookUrl(url);
      } catch (err) {
        console.error("❌ Error loading book:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-white">
        Loading book...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-red-400 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">❌ Failed to Load Book</h2>
          <p className="mt-2">{error}</p>
          <p className="text-xs mt-4 text-gray-500">Book ID: {id}</p>
        </div>
      </div>
    );
  }

  if (!bookUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-red-400">
        <div className="text-center">
          <h2>❌ Book URL not found</h2>
          <p>Check backend field: "file"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <KindleReader bookUrl={bookUrl} />
    </div>
  );
};

export default BookReaderPage;