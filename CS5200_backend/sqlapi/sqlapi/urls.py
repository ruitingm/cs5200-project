"""
URL configuration for sqlapi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from api.views.auth_views import login
from api.views.problem_views import list_problems, get_problem, submit_problem
from api.views.tag_views import list_tags, list_tag_problems
from api.views.submission_views import list_submissions
from api.views.chat_views import nl2sql

urlpatterns = [
    path("auth/login/", login),
    path("problems/", list_problems),
    path("problems/<int:pid>/", get_problem),
    path("problems/<int:pid>/submit/", submit_problem),

    path("tags/", list_tags),
    path("tags/<int:tag_id>/problems/", list_tag_problems),

    path("submissions/<int:account_number>/", list_submissions),

    path("nl2sql/", nl2sql),
]
