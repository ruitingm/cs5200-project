from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def admin_user_stats(request):
    """
    Admin-side statistics: per-user submission summary.

    For each account, return:
    - account_number
    - email, first_name, last_name
    - total_submissions
    - correct_submissions
    """

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                a.Account_number,
                up.Email,
                up.First_name,
                up.Last_name,
                COUNT(s.Submission_ID) AS total_submissions,
                SUM(CASE WHEN s.Is_correct = TRUE THEN 1 ELSE 0 END) AS correct_submissions
            FROM ACCOUNT a
            LEFT JOIN USER_PROFILE up
                ON a.Email = up.Email
            LEFT JOIN SUBMISSION s
                ON a.Account_number = s.Account_number
            GROUP BY
                a.Account_number,
                up.Email,
                up.First_name,
                up.Last_name
            ORDER BY
                correct_submissions DESC,
                total_submissions DESC,
                a.Account_number ASC;
            """
        )
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    results = [dict(zip(columns, row)) for row in rows]
    return Response(results)


@api_view(["GET"])
def admin_problem_stats(request):
    """
    Admin-side statistics: per-problem performance summary.

    For each problem, return:
    - problem_id, problem_description
    - difficulty_level
    - sql_concept
    - submission_count
    - correct_submissions
    """

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                p.Problem_ID,
                p.Problem_description,
                d.Difficulty_level,
                c.SQL_concept,
                COUNT(s.Submission_ID) AS submission_count,
                SUM(CASE WHEN s.Is_correct = TRUE THEN 1 ELSE 0 END) AS correct_submissions
            FROM PROBLEM p
            LEFT JOIN TAG t
                ON p.Tag_ID = t.Tag_ID
            LEFT JOIN DIFFICULTY_TAG d
                ON t.Difficulty_ID = d.Difficulty_ID
            LEFT JOIN CONCEPT_TAG c
                ON t.Concept_ID = c.Concept_ID
            LEFT JOIN SUBMISSION s
                ON p.Problem_ID = s.Problem_ID
            GROUP BY
                p.Problem_ID,
                p.Problem_description,
                d.Difficulty_level,
                c.SQL_concept
            ORDER BY
                submission_count DESC,
                p.Problem_ID ASC;
            """
        )
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    results = [dict(zip(columns, row)) for row in rows]
    return Response(results)
