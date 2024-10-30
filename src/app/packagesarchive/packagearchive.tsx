"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // For App Router search params

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  photoUrl: string;
  lat: number;
  lng: number;
}

const ITEMS_PER_PAGE = 4; // Number of places to show per page

const PackageArchive: React.FC = () => {
  const searchParams = useSearchParams();
  const city = searchParams.get("city"); // Get the 'city' from query params
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOMAPS_API_KEY as string;

  const getPhotoUrl = (photoReference: string) =>
    `https://maps.gomaps.pro/maps/api/place/photo?photo_reference=${photoReference}&maxwidth=400&key=${apiKey}`;

  const fetchPlaces = async (destination: string) => {
    try {
      const geocodeResponse = await axios.get(
        `https://maps.gomaps.pro/maps/api/geocode/json`,
        {
          params: {
            address: destination,
            key: apiKey,
          },
        }
      );

      if (geocodeResponse.data.status !== "OK") {
        console.error("Geocode API Error:", geocodeResponse.data);
        setError(`Error: ${geocodeResponse.data.status}`);
        return;
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      const response = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: 50000,
            type: "tourist_attraction",
            key: apiKey,
          },
        }
      );

      if (response.data.status !== "OK") {
        console.error("Nearby Search API Error:", response.data);
        setError(`Error: ${response.data.status}`);
        return;
      }

      const fetchedPlaces = response.data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity || "No address available",
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        photoUrl: place.photos?.[0]?.photo_reference
          ? getPhotoUrl(place.photos[0].photo_reference)
          : "/placeholder-image.png",
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }));

      setPlaces(fetchedPlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
      setError(
        "Unable to fetch places. Please check your API key and network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) fetchPlaces(city);
  }, [city]);

  // Calculate the places to display on the current page
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentPlaces = places.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(places.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero Section */}
      <div className="relative h-[500px] mb-24">
        <img
          src="/packages-archive-hero-background.png"
          alt="Hero Background"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center"></div>
      </div>

      <div className="relative flex flex-col md:flex-row mt-32 gap-6">
        {/* Tour Packages Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            currentPlaces.map((place, index) => (
              <Link
              key={index}
              href={{
                pathname: `/tourinfo/${place.place_id}/information`,
                query: {
                  name: place.name,
                  vicinity: place.vicinity,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  lat: place.lat,
                  lng: place.lng,
                },
              }}
            >
              <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl">
                <Image
                  src={place.photoUrl}
                  alt={place.name}
                  width={300}
                  height={200}
                  className="rounded-t-lg"
                />
                <div className="mt-4">
                  <h2 className="text-lg font-semibold">{place.name}</h2>
                  <p className="text-gray-600">{place.vicinity}</p>
                  <p className="text-gray-600">Rating: {place.rating}</p>
                  <p className="text-sm text-gray-500">
                    {place.user_ratings_total} reviews
                  </p>
                </div>
              </div>
            </Link>
            
            
            ))
          )}
        </div>

        {/* Plan Your Trip Section (Sidebar) */}
        <div className="w-full md:w-1/3 bg-gray-100 p-6 rounded-lg shadow-lg relative">
          <h2 className="text-xl font-semibold mb-4">Plan Your Trip</h2>

          <label
            htmlFor="search-tour"
            className="block mb-2 text-sm text-gray-700"
          >
            Search Tour
          </label>
          <input
            id="search-tour"
            type="text"
            placeholder="Search Tour"
            className="border rounded-md p-2 mb-4 w-full"
          />

          <label
            htmlFor="where-to"
            className="block mb-2 text-sm text-gray-700"
          >
            Where To?
          </label>
          <input
            id="where-to"
            type="text"
            placeholder="Where To?"
            className="border rounded-md p-2 mb-4 w-full"
          />

          <label
            htmlFor="trip-date"
            className="block mb-2 text-sm text-gray-700"
          >
            Trip Date
          </label>
          <input
            id="trip-date"
            type="date"
            className="border rounded-md p-2 mb-4 w-full"
          />

          <label
            htmlFor="price-range"
            className="block mb-2 text-sm text-gray-700"
          >
            Filter by Price
          </label>
          <div className="flex items-center mb-4">
            <input
              id="price-range"
              type="range"
              min="12"
              max="1200"
              className="w-full"
            />
            <span className="ml-4 text-sm text-gray-600">
              Price: $12 - $1200
            </span>
          </div>

          <button className="bg-red-500 text-white w-full py-2 rounded-md mt-4">
            Book Now
          </button>

          <div className="absolute bottom-0 right-0 transform translate-x-10 translate-y-10">
            <Image
              src="/bag-airplane.svg"
              alt="Bag and Plane"
              width={96}
              height={96}
            />
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <footer className="flex justify-center mt-10">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 mx-1 rounded-md ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </footer>

      <div className="absolute top-0 right-0 transform translate-x-20 -translate-y-10">
        <img src="/seashell.svg" alt="Seashell" width={48} height={48} />
      </div>
    </div>
  );
};

export default PackageArchive;
