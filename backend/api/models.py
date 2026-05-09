from django.db import models
from django.utils import timezone


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class RecruiterProfile(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.full_name} @ {self.company_name or 'Unknown Company'}"


class Resume(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=1024, blank=True)
    status = models.CharField(max_length=50, default="pending")
    ats_score = models.FloatField(blank=True, null=True)
    summary = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    suggestions = models.TextField(blank=True)
    experience = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.file_name


class Skill(TimestampedModel):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    proficiency = models.CharField(max_length=100, blank=True)
    tags = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name


class Project(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    link = models.URLField(blank=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.title


class Certification(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255, blank=True)
    issue_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=255, blank=True)
    credential_url = models.URLField(blank=True)

    def __str__(self):
        return self.name


class PlacementAnalytics(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True)
    job_application_count = models.IntegerField(default=0)
    interview_count = models.IntegerField(default=0)
    placement_rate = models.FloatField(blank=True, null=True)
    score_summary = models.JSONField(default=dict, blank=True)
    data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"PlacementAnalytics for {self.user_id or 'unknown'}"


class LearningRoadmap(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    steps = models.JSONField(default=list, blank=True)
    target_skills = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.title


class Job(TimestampedModel):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    requirements = models.JSONField(default=list, blank=True)
    employment_type = models.CharField(max_length=100, blank=True)
    posted_by_id = models.CharField(max_length=255, blank=True)
    posted_by_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} @ {self.company}"


class JobApplication(TimestampedModel):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255, blank=True, null=True)
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=100, default="pending")
    applied_at = models.DateTimeField(default=timezone.now)
    cover_letter = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Application for {self.job.title} ({self.status})"


class MockInterview(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    score = models.FloatField(blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"MockInterview for {self.user_id or 'unknown'}"


class InterviewQuestion(TimestampedModel):
    mock_interview = models.ForeignKey(MockInterview, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    answer_text = models.TextField(blank=True)
    difficulty = models.CharField(max_length=50, blank=True)
    feedback = models.TextField(blank=True)

    def __str__(self):
        return self.question_text[:80]


class CodingProblem(TimestampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=50, blank=True)
    starter_code = models.TextField(blank=True)
    test_cases = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.title


class CodingSubmission(TimestampedModel):
    coding_problem = models.ForeignKey(CodingProblem, on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255, blank=True, null=True)
    code = models.TextField(blank=True)
    language = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=100, blank=True)
    score = models.FloatField(blank=True, null=True)
    submitted_at = models.DateTimeField(default=timezone.now)
    result_details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Submission for {self.coding_problem.title}"


class Notification(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    category = models.CharField(max_length=100, blank=True)
    link = models.URLField(blank=True)

    def __str__(self):
        return self.title


class ChatbotConversation(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True)
    messages = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"ChatbotConversation {self.session_id or self.id}"


class PlatformAnalytics(TimestampedModel):
    date = models.DateField(default=timezone.now)
    active_users = models.IntegerField(default=0)
    resume_uploads = models.IntegerField(default=0)
    job_applications = models.IntegerField(default=0)
    interviews_completed = models.IntegerField(default=0)
    data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"PlatformAnalytics {self.date}"


class CompanyExperience(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    company_name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.role} @ {self.company_name}"


class Leaderboard(TimestampedModel):
    user_id = models.CharField(max_length=255, blank=True, null=True)
    score = models.FloatField(default=0.0)
    rank = models.IntegerField(default=0)
    metric = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user_id or 'user'}: {self.score}"