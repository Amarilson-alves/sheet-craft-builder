// Utility functions for permission management
// Currently returns true for all permissions, but can be extended for role-based access

export function canManageMaterials(): boolean {
  // TODO: Implement role-based permission checking
  // For now, all users can manage materials
  return true;
}

export function canDeleteMaterials(): boolean {
  // TODO: Implement role-based permission checking  
  // For now, all users can delete materials
  return true;
}

export function canIncrementMaterials(): boolean {
  // TODO: Implement role-based permission checking
  // For now, all users can increment materials  
  return true;
}