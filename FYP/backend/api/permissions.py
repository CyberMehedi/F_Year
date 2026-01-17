from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsCleaner(permissions.BasePermission):
    """
    Custom permission to only allow cleaner users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CLEANER'


class IsStudent(permissions.BasePermission):
    """
    Custom permission to only allow student users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'STUDENT'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access anything
        if request.user.role == 'ADMIN':
            return True
        
        # Check if obj has a student or user field
        if hasattr(obj, 'student'):
            return obj.student == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
