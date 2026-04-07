import React from "react";
import { useNavigate } from "react-router-dom";

const GiftCardsComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="mb-5 text-[32px] font-bold text-[#273c2e]">
        🎁 Gift Cards are Coming Soon!
      </h1>

      <button
        onClick={() => navigate('/')}
        className="rounded-lg bg-[#333] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-black"
      >
        ⬅ Back to Home
      </button>
    </div>
  );
};

export default GiftCardsComingSoon;