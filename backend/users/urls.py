from django.urls import path
from .views import (
    UserListCreateView,
    UserRetrieveUpdateDestroyView,
    ArchiveUserView,
    UnarchiveUserView,
    CustomTokenObtainPairView,
    current_user,
)

urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-retrieve-update-destroy'),
    path('users/<int:pk>/archive/', ArchiveUserView.as_view(), name='archive-user'),
    path('users/<int:pk>/unarchive/', UnarchiveUserView.as_view(), name='unarchive-user'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/me/', current_user, name='current-user'),
]
