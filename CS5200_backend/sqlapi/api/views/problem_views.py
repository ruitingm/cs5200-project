import json
from django.db import connection
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import datetime

# List all problems
def list_problems(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.Problem_ID,
                p.Problem_description,
                t.Tag_ID,
                d.Difficulty_level,
                c.SQL_concept
            FROM PROBLEM p
            LEFT JOIN TAG t ON p.Tag_ID = t.Tag_ID
            LEFT JOIN DIFFICULTY_TAG d ON t.Difficulty_ID = d.Difficulty_ID
            LEFT JOIN CONCEPT_TAG c ON t.Concept_ID = c.Concept_ID
        """)

        rows = cursor.fetchall()

    results = []
    for row in rows:
        problem_id = row[0]
        description = row[1] or ""
        difficulty = row[3] or ""
        concept = row[4] or ""

        # 直接生成 title
        p_title = description.split("\n")[0][:80]

        # concept 转换为数组
        concept_tags = (
            [c.strip().capitalize() for c in concept.split(",")]
            if concept else []
        )

        results.append({
            "pId": problem_id,
            "pTitle": p_title,
            "difficultyTag": difficulty.capitalize(),
            "conceptTag": concept_tags,   # ⭐ 用真正的 concept_tags
            "pDescription": description,
            "pSolutionId": 1,
            "reviewed": True
        })

    return JsonResponse(results, safe=False)

# Get a single problem
def get_problem(request, pid):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.Problem_ID,
                p.Problem_description,
                t.Tag_ID,
                d.Difficulty_level,
                c.SQL_concept
            FROM PROBLEM p
            LEFT JOIN TAG t ON p.Tag_ID = t.Tag_ID
            LEFT JOIN DIFFICULTY_TAG d ON t.Difficulty_ID = d.Difficulty_ID
            LEFT JOIN CONCEPT_TAG c ON t.Concept_ID = c.Concept_ID
            WHERE p.Problem_ID = %s
        """, [pid])

        row = cursor.fetchone()

        if row is None:
            return JsonResponse({"error": "Problem not found"}, status=404)

    problem_id = row[0]
    description = row[1]
    tag_id = row[2]
    difficulty = row[3]
    concept = row[4]

    # 同样应用转换
    p_title = description.split("\n")[0][:80] if description else ""
    concept_tags = (
        [c.strip() for c in concept.split(",")] if concept else []
    )

    return JsonResponse({
        "pId": problem_id,
        "pTitle": p_title,
        "difficultyTag": difficulty.capitalize() if difficulty else "",
        "conceptTag": concept_tags,
        "pDescription": description,
        "pSolutionId": tag_id,
        "reviewed": True
    })




# Submit SQL answer
@api_view(["POST"])

def submit_problem(request, pid):
    data = json.loads(request.body)

    account_number = data["account_number"]
    submission_text = data["submission"]
    is_correct = data.get("is_correct", False)

    now = datetime.datetime.now()

    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO SUBMISSION
            (Problem_ID, Account_number, Submission_description, Is_correct, Time_start, Time_end)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, [pid, account_number, submission_text, is_correct, now, now])

    return JsonResponse({"success": True})
