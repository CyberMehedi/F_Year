"""
URL configuration for hostel_cleaning project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint showing available routes"""
    return Response({
        'message': 'Welcome to Albukhary International University Hostel Cleaning Service API',
        'version': '1.0.0',
        'endpoints': {
            'admin_panel': '/admin/',
            'api_base': '/api/',
            'authentication': {
                'login': '/api/auth/login/',
                'register_student': '/api/auth/register/student/',
                'register_cleaner': '/api/auth/register/cleaner/',
                'token_refresh': '/api/auth/token/refresh/',
                'current_user': '/api/auth/me/',
            },
            'bookings': '/api/bookings/',
            'cleaner': {
                'today_tasks': '/api/cleaner/tasks/today/',
                'new_requests': '/api/cleaner/tasks/new/',
                'all_tasks': '/api/cleaner/tasks/all/',
                'history': '/api/cleaner/history/',
                'stats': '/api/cleaner/stats/',
            },
            'issues': '/api/issues/',
            'notifications': '/api/notifications/',
            'admin': {
                'stats': '/api/admin/stats/',
                'cleaners': '/api/admin/cleaners/',
            },
            'profile': {
                'student': '/api/profile/student/',
                'cleaner': '/api/profile/cleaner/',
            }
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
