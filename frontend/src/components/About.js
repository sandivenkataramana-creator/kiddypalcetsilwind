import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from './config';

const About = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/about`)
      .then((response) => {
        setContent(response.data?.content || '');
      })
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-[28px] bg-white/85 p-6 shadow-soft ring-1 ring-black/5 backdrop-blur-sm sm:p-8 lg:p-10">
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-[#222] sm:text-4xl">
            About Us
          </h1>

          {loading ? (
            <p className="text-base font-medium text-[#2e79e3]">Loading...</p>
          ) : (
            <pre className="whitespace-pre-wrap text-base leading-8 text-[#333] [font-family:inherit]">
              {content}
            </pre>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
