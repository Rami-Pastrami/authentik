"""RBAC (User object permissions)"""
from django.db.models import QuerySet
from django_filters.filters import CharFilter, ChoiceFilter
from django_filters.filterset import FilterSet
from guardian.models import UserObjectPermission
from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet

from authentik.core.api.groups import GroupMemberSerializer
from authentik.core.api.rbac import ContentTypeSerializer, PermissionSerializer
from authentik.policies.event_matcher.models import model_choices


class UserObjectPermissionSerializer(ModelSerializer):
    """Permission applying to a single object and a single user"""

    user = GroupMemberSerializer(read_only=True)
    permission = PermissionSerializer(read_only=True)
    content_type = ContentTypeSerializer(read_only=True)

    class Meta:
        model = UserObjectPermission
        fields = "__all__"


class RBACUserFilter(FilterSet):
    model = ChoiceFilter(choices=model_choices(), method="filter_model")
    object_pk = CharFilter()

    def filter_model(self, queryset: QuerySet, name, value: str):
        """Filter by ContentType model"""
        app, _, model = value.partition(".")
        return queryset.filter(
            content_type__app_label=app,
            content_type__model=model,
        )

    class Meta:
        model = UserObjectPermission
        fields = ["user", "model", "object_pk"]


class RBACObjectUserViewSet(ModelViewSet):
    """Object user permissions"""

    queryset = UserObjectPermission.objects.all()
    serializer_class = UserObjectPermissionSerializer
    filterset_class = RBACUserFilter
