from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(read_only=True)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ResumeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    file_name = serializers.CharField()
    file_path = serializers.CharField()
    status = serializers.CharField(required=False, default='pending')
    ats_score = serializers.FloatField(required=False, allow_null=True)
    summary = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    missing_skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    suggestions = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    education = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    created_at = serializers.DateTimeField(read_only=True)


class JobSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField()
    company = serializers.CharField()
    location = serializers.CharField(required=False, allow_blank=True)
    requirements = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    posted_by = serializers.CharField(read_only=True)
    posted_by_id = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
