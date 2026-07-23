import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { User, UserResponse, UpdateUserPayload } from '../types';

type UsersProviderProps = {
  children: ReactNode;
};

type UsersContextType = {
  users: User[];
  refreshUsers: () => Promise<void>;
  getUsers: (page?: number) => Promise<UserResponse | null>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
};

export const UsersContext = createContext<UsersContextType | undefined>(
  undefined
);

function UsersProvider({ children }: UsersProviderProps) {
  const [users, setUsers] = useState<User[]>([]);

  const getUsers = async (
    page: number = 1
  ): Promise<UserResponse | null> => {
    try {
      const response = await api.get(
        `/api/v1/users?page=${page}&limit=10`
      );

      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const refreshUsers = async () => {
    try {
      const response = await api.get<User[]>('/api/v1/users/names');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateUser = async (
    id: string,
    data: UpdateUserPayload
  ): Promise<User | null> => {
    try {
      const response = await api.put(`/api/v1/users/${id}`, data);

      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/api/v1/users/${id}`);
      setUsers(prev => prev.filter(user => user._id !== id));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <UsersContext.Provider
      value={{
        users,
        refreshUsers,
        getUsers,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export default UsersProvider;

export function useUsers() {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error('useUsers must be used within UsersProvider');
  }

  return context;
}