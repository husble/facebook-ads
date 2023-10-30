"use client"

import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface User {
  position?: string;
}

interface UserContext {
  user: User;
  dispatch: Dispatch<SetStateAction<object>>;
}

export const UserContext = createContext<UserContext>({
  user: {},
  dispatch: () => {}
})

export default function UserProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setSetUser] = useState({});
  return (
    <UserContext.Provider value={{user, dispatch: setSetUser}}>
      {children}
    </UserContext.Provider>
  )
}