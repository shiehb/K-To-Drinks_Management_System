from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Store
from .serializers import StoreSerializer
import logging

logger = logging.getLogger(__name__)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()  # Make sure this is defined
    serializer_class = StoreSerializer

    def get_queryset(self):
        queryset = Store.objects.all()
        archived = self.request.query_params.get('archived', None)
        
        if archived is not None:
            archived = archived.lower() == 'true'
            queryset = queryset.filter(is_archived=archived)
        
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            
            if 'email' in data and data['email'] == "":
                data['email'] = None
                
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            logger.error(f"Error creating store: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        store = self.get_object()
        archive_action = request.data.get('archive', True)
        
        store.is_archived = archive_action
        store.archived_at = timezone.now() if archive_action else None
        store.save()
        
        serializer = self.get_serializer(store)
        return Response(serializer.data)