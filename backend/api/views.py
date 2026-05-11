from datetime import datetime
import json
import urllib.request as urllib_request
import urllib.error as urllib_error
import os

from bson.objectid import ObjectId
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.core.files.storage import default_storage
import os

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


class UploadResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Expect a multipart/form-data POST with a file field named 'file'
        uploaded = request.FILES.get('file')
        if not uploaded:
            return Response({'detail': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build a safe path under MEDIA_ROOT
        user_id = getattr(request.user, 'id', 'anonymous')
        filename = uploaded.name.replace(' ', '_')
        dest_path = os.path.join('resumes', str(user_id), f"{int(datetime.utcnow().timestamp() * 1000)}-{filename}")
        # Ensure directory exists (default_storage will handle directories for filesystem)
        saved_path = default_storage.save(dest_path, uploaded)
        file_url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
        return Response({'file_path': saved_path, 'file_url': file_url}, status=status.HTTP_201_CREATED)


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
            # Find the doc first so we can remove stored file if present
            doc = resumes_col.find_one({'_id': ObjectId(pk), 'user_id': request.user.id})
        except Exception:
            doc = None
        if not doc:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Delete stored file if available
        file_path = doc.get('file_path')
        if file_path:
            try:
                default_storage.delete(file_path)
            except Exception:
                # ignore file deletion errors
                pass

        try:
            result = resumes_col.delete_one({'_id': ObjectId(pk), 'user_id': request.user.id})
        except Exception:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        if result.deleted_count == 0:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AnalyzeResumeView(APIView):
    """
    Run AI analysis on a resume. Expects POST to /api/resumes/<pk>/analyze/ with JSON { raw_text: "..." }
    Uses GEMINI_API_KEY from environment and calls the AI gateway. Persists analysis to the resume document.
    """

    authentication_classes = [MongoTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        raw_text = request.data.get('raw_text', '')
        if not raw_text or len(raw_text) < 20:
            return Response({'detail': 'raw_text is required and should be at least 20 chars.'}, status=status.HTTP_400_BAD_REQUEST)

        # verify resume exists and belongs to user
        try:
            doc = resumes_col.find_one({'_id': ObjectId(pk), 'user_id': request.user.id})
        except Exception:
            doc = None
        if not doc:
            return Response({'detail': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        # mark analyzing
        resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': {'status': 'analyzing', 'raw_text': raw_text}})

        api_key = os.getenv('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            # Try loading from a local .env file in the backend project root as a fallback
            try:
                env_path = os.path.join(str(getattr(settings, 'BASE_DIR', '')), '.env')
                if env_path and os.path.exists(env_path):
                    with open(env_path, 'r', encoding='utf-8') as fh:
                        for line in fh:
                            if line.strip().startswith('GEMINI_API_KEY='):
                                val = line.split('=', 1)[1].strip().strip('"').strip("'")
                                if val:
                                    api_key = val
                                    break
            except Exception:
                api_key = None

        if not api_key:
            resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': {'status': 'failed'}})
            return Response({'detail': 'GEMINI_API_KEY not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        system_prompt = (
            "You are an expert ATS (Applicant Tracking System) and senior technical recruiter.\n"
            "Analyze the candidate's resume and produce a strict JSON analysis using the provided tool.\n"
            "- ats_score: 0-100. Penalize missing contact info, no quantified impact, weak action verbs, walls of text, no skills section, irrelevant content.\n"
            "- skills: concrete technologies, tools, frameworks, languages and methodologies the candidate clearly demonstrates.\n"
            "- missing_skills: high-demand skills the resume should include for stronger market positioning (think: cloud, testing, system design, data, leadership for senior roles).\n"
            "- suggestions: specific, actionable improvements (rewriting bullets with metrics, restructuring sections, ATS keyword fixes, formatting).\n"
            "- experience and education: extract structured entries.\n"
            "Be concise and concrete."
        )

        tool = {
            "type": "function",
            "function": {
                "name": "submit_resume_analysis",
                "description": "Submit the structured ATS analysis of the resume.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "ats_score": {"type": "integer", "minimum": 0, "maximum": 100},
                        "summary": {"type": "string"},
                        "skills": {"type": "array", "items": {"type": "string"}},
                        "missing_skills": {"type": "array", "items": {"type": "string"}},
                        "suggestions": {"type": "array", "items": {"type": "string"}},
                        "experience": {"type": "array"},
                        "education": {"type": "array"},
                    },
                    "required": ["ats_score", "summary", "skills", "missing_skills", "suggestions", "experience", "education"],
                    "additionalProperties": False,
                },
            },
        }

        payload = {
            "model": "google/gemini-3-flash-preview",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this resume:\n\n{raw_text}"},
            ],
            "tools": [tool],
            "tool_choice": {"type": "function", "function": {"name": "submit_resume_analysis"}},
        }

        req = urllib_request.Request(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib_request.urlopen(req, timeout=90) as r:
                resp_text = r.read().decode("utf-8")
                result = json.loads(resp_text)
        except urllib_error.HTTPError as e:
            resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': {'status': 'failed'}})
            return Response({'detail': f'AI gateway error: {e.code}'}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': {'status': 'failed'}})
            return Response({'detail': f'AI request failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # extract tool call arguments
        try:
            choices = result.get('choices', [])
            args = None
            if choices:
                message = choices[0].get('message', {})
                tool_calls = message.get('tool_calls', [])
                if tool_calls:
                    args = tool_calls[0].get('function', {}).get('arguments')
        except Exception:
            args = None

        if not args:
            resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': {'status': 'failed'}})
            return Response({'detail': 'AI returned no analysis.'}, status=status.HTTP_502_BAD_GATEWAY)

        try:
            parsed = json.loads(args)
        except Exception as e:
            resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': {'status': 'failed'}})
            return Response({'detail': 'Failed to parse analysis output.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        update_data = {
            'status': 'analyzed',
            'ats_score': parsed.get('ats_score'),
            'summary': parsed.get('summary'),
            'skills': parsed.get('skills'),
            'missing_skills': parsed.get('missing_skills'),
            'suggestions': parsed.get('suggestions'),
            'experience': parsed.get('experience'),
            'education': parsed.get('education'),
        }

        try:
            resumes_col.update_one({'_id': ObjectId(pk), 'user_id': request.user.id}, {'$set': update_data})
        except Exception as e:
            return Response({'detail': 'Failed to save analysis.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'ok': True, 'analysis': parsed})


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
