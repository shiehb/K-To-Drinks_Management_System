# apps/stores/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Store
from .serializers import StoreSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Store.objects.all()
        
        # Filter by archived status
        archived = self.request.query_params.get('archived')
        if archived is not None:
            archived = archived.lower() == 'true'
            queryset = queryset.filter(is_archived=archived)
        
        # Filter by day
        day = self.request.query_params.get('day')
        if day:
            queryset = queryset.filter(day=day)
        
        # Search by name or location
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(location__icontains=search) |
                models.Q(owner_name__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        store = self.get_object()
        archive = request.data.get('archive', True)
        
        store.is_archived = archive
        store.save()
        
        serializer = self.get_serializer(store)
        return Response(serializer.data)