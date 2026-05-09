# This app stores data in MongoDB directly using pymongo.
# Django ORM models are not used for the backend business data.

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)  # URL or path to file
    status = models.CharField(max_length=20, default='pending')  # pending, analyzed, etc.
    ats_score = models.FloatField(null=True, blank=True)
    summary = models.TextField(blank=True)
    skills = models.JSONField(default=list)  # List of skills
    missing_skills = models.JSONField(default=list)
    suggestions = models.TextField(blank=True)
    experience = models.JSONField(default=list)  # List of experiences
    education = models.JSONField(default=list)  # List of educations
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.file_name}"

class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    requirements = models.JSONField(default=list)  # List of required skills
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'admin'})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
