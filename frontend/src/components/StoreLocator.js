import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import Header from "./Header";
import Footer from "./Footer";

const StoreLocator = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stores`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.stores) setStores(data.stores);
      })
      .catch((err) => console.error("Failed to load stores", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <div className="mx-auto min-h-[60vh] w-full max-w-6xl px-4 py-10 text-base font-semibold text-[#273c2e] sm:px-6 lg:px-8">
          Loading stores...
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-white px-4 py-8 text-[#273c2e] sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="mb-8 text-3xl font-black tracking-tight sm:text-4xl">Our Stores</h1>

          <div className="space-y-12">
          {stores.map((store, index) => {
            const isEven = index % 2 === 1; // 2nd,4th,6th...

            return (
              <div key={store.id} className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                {/* LEFT SIDE */}
                <div className="flex justify-center">
                  {isEven ? (
                    <div className="w-full max-w-[450px] rounded-2xl border border-[#ede6d9] bg-[#fffaf1] p-5 shadow-[0_8px_20px_rgba(39,60,46,0.08)]">
                      <h3 className="text-xl font-bold text-[#273c2e]">{store.name}</h3>
                      <p className="mt-2 text-sm text-[#444]">{store.address}</p>
                      <p className="mt-1 text-sm text-[#444]">
                        {store.city}, {store.state} {store.postal_code}
                      </p>
                      <p className="mt-2 text-sm text-[#444]">
                        {store.phone} <br />
                        {store.email}
                      </p>
                      {store.open_hours && (
                        <p className="mt-2 text-sm font-semibold text-green-700">Open Hours: {store.open_hours}</p>
                      )}
                    </div>
                  ) : (
                    <div className="h-[240px] w-full max-w-[450px] overflow-hidden rounded-2xl bg-[#eee] shadow-[0_8px_20px_rgba(39,60,46,0.1)]">
                      {store.image_url ? (
                        <img
                          src={`${API_BASE_URL}${store.image_url}`}
                          alt={store.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl font-bold text-[#777]">No Image</div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE */}
                <div className="flex justify-center">
                  {isEven ? (
                    <div className="h-[240px] w-full max-w-[450px] overflow-hidden rounded-2xl bg-[#eee] shadow-[0_8px_20px_rgba(39,60,46,0.1)]">
                      {store.image_url ? (
                        <img
                          src={`${API_BASE_URL}${store.image_url}`}
                          alt={store.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl font-bold text-[#777]">No Image</div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full max-w-[450px] rounded-2xl border border-[#ede6d9] bg-[#fffaf1] p-5 shadow-[0_8px_20px_rgba(39,60,46,0.08)]">
                      <h3 className="text-xl font-bold text-[#273c2e]">{store.name}</h3>
                      <p className="mt-2 text-sm text-[#444]">{store.address}</p>
                      <p className="mt-1 text-sm text-[#444]">
                        {store.city}, {store.state} {store.postal_code}
                      </p>
                      <p className="mt-2 text-sm text-[#444]">
                        {store.phone} <br />
                        {store.email}
                      </p>
                      {store.open_hours && (
                        <p className="mt-2 text-sm font-semibold text-green-700">Open Hours: {store.open_hours}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default StoreLocator;
