export enum UserRole {
    Admin = 0,
    Moderator = 1,
    Customer = 2,
    Farmer = 3,
    Registered = 4,
}

export const UserRoleLabel: Record<UserRole, string> = {
    [UserRole.Admin]: 'Admin',
    [UserRole.Moderator]: 'Moderator',
    [UserRole.Customer]: 'Customer',
    [UserRole.Farmer]: 'Farmer',
    [UserRole.Registered]: 'Registered',
}