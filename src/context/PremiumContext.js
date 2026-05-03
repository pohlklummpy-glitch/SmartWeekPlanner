import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const { switchToFreeTheme } = useTheme();
  const [isPremium, setIsPremium] = useState(false);

  // Check if premium has expired
  const checkPremiumExpiration = async (userData) => {
    if (!userData?.isPremium || !userData?.premiumExpiresAt) return false;
    
    const expiresAt = new Date(userData.premiumExpiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      // Premium expired - remove it
      console.log('Premium expired, removing...');
      if (user?.id) {
        await updateDoc(doc(db, 'users', user.id), {
          isPremium: false,
          premiumExpiresAt: null,
        }).catch((e) => console.error('Failed to remove expired premium:', e));
      }
      setIsPremium(false);
      
      // Switch to free theme if user has premium theme
      if (switchToFreeTheme) {
        await switchToFreeTheme();
      }
      
      return true; // Expired
    }
    return false; // Still valid
  };

  // Listen to premium status from Firestore
  useEffect(() => {
    if (!user?.id) { setIsPremium(false); return; }
    
    const unsub = onSnapshot(
      doc(db, 'users', user.id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          
          // Check expiration first
          checkPremiumExpiration(data);
          
          setIsPremium(!!data.isPremium);
        }
      },
      (e) => console.error('premium listener:', e)
    );
    
    return unsub;
  }, [user?.id]);

  // Check expiration every minute
  useEffect(() => {
    if (!user?.id || !isPremium) return;
    
    const interval = setInterval(async () => {
      const snap = await getDoc(doc(db, 'users', user.id));
      if (snap?.exists()) {
        await checkPremiumExpiration(snap.data());
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user?.id, isPremium]);

  const activatePremium = async () => {
    setIsPremium(true);
    if (user?.id) {
      await updateDoc(doc(db, 'users', user.id), { isPremium: true }).catch(() => {});
    }
  };

  const deactivatePremium = async () => {
    setIsPremium(false);
    if (user?.id) {
      await updateDoc(doc(db, 'users', user.id), { 
        isPremium: false,
        premiumExpiresAt: null,
      }).catch(() => {});
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, activatePremium, deactivatePremium, checkPremiumExpiration }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() { return useContext(PremiumContext); }
