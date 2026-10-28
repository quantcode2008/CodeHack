"use client";

// Re-export from unified AuthContext for seamless compatibility
export {
  AuthProvider as RoleProvider,
  useRole,
  useAuth,
  type Role as UserRole,
  type UserProfile,
  type UserCredentialItem,
} from "./AuthContext";
