"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/AuthContext"; // Import the useAuth hook
import { useRouter } from "next/navigation";
import { CiUser } from "react-icons/ci";

export default function Header() {
  const { username, isLoggedIn, logout, profilePicture } = useAuth(); // Use the Auth context
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null); // Ref to track the dropdown
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(false);
    }
  };

  // Attach and clean up event listener
  useEffect(() => {
    console.log("profilepicture:",profilePicture)
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/"); // Redirect after logout
  };

  return (
    <header className="w-full h-20 flex items-center fixed z-50 justify-between px-8 bg-white shadow-md">
      {/* Left: Logo with Image */}
      <div className="flex items-center space-x-2">
        <Image src="/lets-go-icon.png" alt="Logo" width={80} height={80} />
      </div>

      {/* Center: Navigation Links */}
      <nav className="flex space-x-8 text-lg font-medium text-pink-600">
        <Link href="/" className="relative group">
          Home
        </Link>
        <Link href="/about" className="relative group">
          About
        </Link>
        <Link href="/services" className="relative group">
          Services
        </Link>
        <Link href="/packagesarchive" className="relative group">
          Upcoming Packages
        </Link>
      </nav>

      {/* Right: User info or Login Button */}
      <div className="relative flex items-center space-x-4">
        {isLoggedIn ? (
          <div className="dropdown" ref={dropdownRef}>
            <div
              tabIndex={0}
              role="button"
              className="flex items-center space-x-2 cursor-pointer btn m-1 bg-white border-pink-400 hover:bg-pink-100"
              onClick={toggleDropdown}
            >
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                {profilePicture && profilePicture.trim() !== "" ? (
                  <img
                    src={profilePicture}
                    alt={`${username}'s profile`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <CiUser className="text-white text-2xl" />
                )}
              </div>
              <p className="text-black">{username}</p>
            </div>

            {/* Dropdown Menu */}
            {dropdownVisible && (
              <ul
                tabIndex={0}
                className="dropdown-content menu absolute duration-1000 right-0 top-8 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50"
              >
                <li>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-pink-100"
                    onClick={() => setDropdownVisible(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-800 hover:bg-pink-100"
                    onClick={() => setDropdownVisible(false)}
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-pink-100"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-md shadow-md hover:bg-pink-600 transition-all"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
