import React, { createContext, useState } from 'react';

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [tableMainColor, setTableMainColor] = useState('#00ff00');
  const [tableSecondaryColor, setTableSecondaryColor] = useState('#008000');
  const [paddlesColor, setPaddlesColor] = useState('#ffffff');

  return (
    <ColorContext.Provider value={{ tableMainColor, setTableMainColor, tableSecondaryColor, setTableSecondaryColor, paddlesColor, setPaddlesColor }}>
      {children}
    </ColorContext.Provider>
  );
};

export default ColorProvider;