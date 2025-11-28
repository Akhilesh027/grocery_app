import { createContext, useContext, useState } from 'react';

const CategoryNavigationContext = createContext();

export const useCategoryNavigation = () => {
  const context = useContext(CategoryNavigationContext);
  if (!context) {
    throw new Error('useCategoryNavigation must be used within CategoryNavigationProvider');
  }
  return context;
};

export const CategoryNavigationProvider = ({ children }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const navigateToCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const clearCategorySelection = () => {
    setSelectedCategoryId(null);
  };

  return (
    <CategoryNavigationContext.Provider
      value={{
        selectedCategoryId,
        navigateToCategory,
        clearCategorySelection,
      }}
    >
      {children}
    </CategoryNavigationContext.Provider>
  );
};
