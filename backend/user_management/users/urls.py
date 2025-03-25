from django.urls import path
from .views import (
    UserListCreateView,
    UserRetrieveUpdateDestroyView,
    ArchiveUserView,
    UnarchiveUserView,
    DeleteUserView,
    LoginView,
)

urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-retrieve-update-destroy'),
    path('users/<int:pk>/archive/', ArchiveUserView.as_view(), name='archive-user'),
    path('users/<int:pk>/unarchive/', UnarchiveUserView.as_view(), name='unarchive-user'),
    path('users/<int:pk>/delete/', DeleteUserView.as_view(), name='delete-user'),  # Explicit delete endpoint
    path('login/', LoginView.as_view(), name='login'),
]
