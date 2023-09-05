"""RBAC (Role object permissions)"""
from guardian.models import GroupObjectPermission
from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet


class RoleObjectPermissionSerializer(ModelSerializer):
    """Permission applying to a single object and a single role"""

    class Meta:
        model = GroupObjectPermission
        fields = "__all__"


class RBACObjectRoleViewSet(ModelViewSet):
    """Object role permissions"""

    queryset = GroupObjectPermission.objects.all()
    serializer_class = RoleObjectPermissionSerializer
    filterset_fields = [
        "group",
    ]
