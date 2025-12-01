from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response

# --------------------------
# GET /topics/
# --------------------------
@api_view(['GET'])
def list_tags(request):
    """
    Return all topics (tags).
    A topic = Difficulty + Concept.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                t.Tag_ID,
                d.Difficulty_level,
                c.SQL_concept
            FROM TAG t
            JOIN DIFFICULTY_TAG d ON t.Difficulty_ID = d.Difficulty_ID
            JOIN CONCEPT_TAG c ON t.Concept_ID = c.Concept_ID
            ORDER BY t.Tag_ID;
        """)
        rows = cursor.fetchall()

    topics = []
    for r in rows:
        topics.append({
            "tag_id": r[0],
            "difficulty": r[1],
            "concept": r[2]
        })

    return Response(topics)


# --------------------------
# GET /topics/<tag_id>/problems/
# --------------------------
@api_view(['GET'])
def list_tag_problems(request, tag_id):
    """
    Return all problems for a given topic (tag).
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                P.Problem_ID,
                P.Problem_description
            FROM PROBLEM P
            JOIN TAG T ON P.Tag_ID = T.Tag_ID
            WHERE T.Tag_ID = %s;
        """, [tag_id])
        rows = cursor.fetchall()

    problems = []
    for r in rows:
        problems.append({
            "problem_id": r[0],
            "description": r[1],
        })

    return Response(problems)
