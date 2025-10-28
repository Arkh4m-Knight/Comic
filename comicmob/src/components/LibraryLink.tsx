"use client";
import { useState, useEffect } from "react";
import SignupModal from "@/src/components/SignupModal";

interface User {
  id: string;
  email: string;
  username: string;
}

export default function LibraryLink() {
  const [user, setUser] = useState<User | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to check auth:", error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  function handleClick(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      setShowSignup(true);
    }
  }

  return (
    <>
      <a 
        href={user ? "/library" : "#"} 
        onClick={handleClick}
        className="hover:text-white"
      >
        Library
      </a>
      
      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onSuccess={() => {
          // Redirect to library after successful signup
          window.location.href = "/library";
        }} 
      />
    </>
  );
}


