import { useState } from 'react';
import { UserCrudService, CreateUserData, UpdateUserData, DeleteUserData } from '../services/userCrudService';

interface UseUserCrudResult {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; message: string; data?: any }>;
  updateUser: (userData: UpdateUserData) => Promise<{ success: boolean; message: string; data?: any }>;
  deleteUser: (userData: DeleteUserData) => Promise<{ success: boolean; message: string; data?: any }>;
}

/**
 * Custom hook for user CRUD operations
 */
export const useUserCrud = (): UseUserCrudResult => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createUser = async (userData: CreateUserData) => {
    setCreating(true);
    try {
      const result = await UserCrudService.createUser(userData);
      return result;
    } finally {
      setCreating(false);
    }
  };

  const updateUser = async (userData: UpdateUserData) => {
    setUpdating(true);
    try {
      const result = await UserCrudService.updateUser(userData);
      return result;
    } finally {
      setUpdating(false);
    }
  };

  const deleteUser = async (userData: DeleteUserData) => {
    setDeleting(true);
    try {
      const result = await UserCrudService.deleteUser(userData);
      return result;
    } finally {
      setDeleting(false);
    }
  };

  return {
    creating,
    updating,
    deleting,
    createUser,
    updateUser,
    deleteUser
  };
};

export default useUserCrud;