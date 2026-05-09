from datetime import datetime

from bson.objectid import ObjectId
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import (
    MongoTokenAuthentication,
    create_token,
    create_user,
    get_user_from_token,
    invalidate_token,
    verify_user,
)
from .mongo import get_collection, serialize_doc
from .permissions import IsAdminRole
from .serializers import (
    JobSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResumeSerializer,
    UserSerializer,
)

resumes_col = get_collection('resumes')
jobs_col = get_collection('jobs')


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if create_user(
            data['username'],
            data['email'],
            data['password'],
            data.get('first_name', ''),
            data.get('last_name', ''),
        ) is None:
            return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = verify_user(data['username'], data['password'])
        token = create_token(user)
        return Response({'token': token, 'user': UserSerializer(user.to_dict()).data}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = verify_user(serializer.validated_data['username'], serializer.validated_data['password'])
        if not user:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        token = create_token(user)
        return Response({'token': token, 'user': UserSerializer(user.to_dict()).data})


class LogoutView(APIView):
    authentication_classes = [MongoTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        authorization = request.META.get('HTTP_AUTHORIZATION', '')
        token_value = authorization.split(' ')[1] if ' ' in authorization else authorization
        invalidate_token(token_value)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    authentication_classes = [MongoTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user.to_dict()).data)


class ResumeViewSet(viewsets.ViewSet):
    authentication_classes = [MongoTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        results = resumes_col.find({'user_id': request.user.id}).sort('created_at', -1)
        return Response([serialize_doc(doc) for doc in results])

    def retrieve(self, request, pk=None):
        try:
            doc = resumes_col.find_one({'_id': ObjectId(pk), 'user_id': request.user.id})
        except Exception:
            doc = None
        if not doc:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_doc(doc))

    def create(self, request):
        serializer = ResumeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payload = serializer.validated_data
        payload['user_id'] = request.user.id
        payload['created_at'] = datetime.utcnow()
        result = resumes_col.insert_one(payload)
        return Response(serialize_doc(resumes_col.find_one({'_id': result.inserted_id})), status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        serializer = ResumeSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        update_data = serializer.validated_data
        try:
            result = resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': update_data})
        except Exception:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        if result.matched_count == 0:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_doc(resumes_col.find_one({'_id': ObjectId(pk)})))

    def destroy(self, request, pk=None):
        try:
            result = resumes_col.delete_one({'_id': ObjectId(pk), 'user_id': request.user.id})
        except Exception:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        if result.deleted_count == 0:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class JobViewSet(viewsets.ViewSet):
    authentication_classes = [MongoTokenAuthentication]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]

    def list(self, request):
        results = jobs_col.find().sort('created_at', -1)
        return Response([serialize_doc(doc) for doc in results])

    def retrieve(self, request, pk=None):
        try:
            doc = jobs_col.find_one({'_id': ObjectId(pk)})
        except Exception:
            doc = None
        if not doc:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_doc(doc))

    def create(self, request):
        serializer = JobSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payload = serializer.validated_data
        payload['posted_by'] = request.user.username
        payload['posted_by_id'] = request.user.id
        payload['created_at'] = datetime.utcnow()
        result = jobs_col.insert_one(payload)
        return Response(serialize_doc(jobs_col.find_one({'_id': result.inserted_id})), status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        serializer = JobSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        update_data = serializer.validated_data
        try:
            result = jobs_col.update_one({'_id': ObjectId(pk)}, {'$set': update_data})
        except Exception:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        if result.matched_count == 0:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serialize_doc(jobs_col.find_one({'_id': ObjectId(pk)})))

    def destroy(self, request, pk=None):
        try:
            result = jobs_col.delete_one({'_id': ObjectId(pk)})
        except Exception:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        if result.deleted_count == 0:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
