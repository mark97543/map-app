import { createContext, useContext, useState, type ReactNode } from 'react';

//Define what datas lives in here 

interface DashboardContextType{
  title:string;
  setTitle:(n:string)=>void;
}

//Create the actual context object
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({children}:{children:ReactNode})=>{
  const [title, setTitle]=useState('');

  return(
    <DashboardContext.Provider value={{
      title,
      setTitle
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

//The hook that the children use to grab
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useMyData must be used within MyProvider");
  return context;
};