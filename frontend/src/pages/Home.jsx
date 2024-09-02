import { useState, useEffect } from "react";
import axios from "axios";
import GuessNumberGame from "../components/GuessNumberGame";
import Loader from "../components/Loader";

function Home() {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://api.quotable.io/random");
      setQuote({ text: response.data.content, author: response.data.author });
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote({ text: "Failed to fetch quote", author: "Unknown" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen">
      <header className="bg-primary text-primary-content p-4">
        <h1 className="text-3xl font-bold">Welcome to The Boring App</h1>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-lg shadow-xl p-6 ">
          <h2 className="text-2xl font-semibold mb-4">Quote of the Day</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader size="large" color="primary" />
            </div>
          ) : (
            <>
              <blockquote className="italic text-lg mb-2">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <p className="text-right">- {quote.author}</p>
            </>
          )}
        </div>
        <GuessNumberGame />
      </main>
    </div>
  );
}

export default Home;
