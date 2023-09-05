from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.serializers import ModelSerializer


class PermissionSerializer(ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "name", "codename"]


class ContentTypeSerializer(ModelSerializer):
    class Meta:
        model = ContentType
        fields = ["id", "app_label", "model"]
