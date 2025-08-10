import React, { createContext, useState, useContext, ReactNode } from "react";

type SearchRadiusContextType = {
  radius: number;
  setRadius: (value: number) => void;
};

const SearchRadiusContext = createContext<SearchRadiusContextType | undefined>(undefined);

export const SearchRadiusProvider = ({ children }: { children: ReactNode }) => {
  const [radius, setRadius] = useState(4000);

  return (
    <SearchRadiusContext.Provider value={{ radius, setRadius }}>
      {children}
    </SearchRadiusContext.Provider>
  );
};

export const useSearchRadius = () => {
  const context = useContext(SearchRadiusContext);
  if (!context) {
    throw new Error("useSearchRadius must be used within SearchRadiusProvider");
  }
  return context;
};

export default function Empty() {
  return null;
}