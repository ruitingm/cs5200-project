from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response

# GET topic = difficulty + concept
@api_view(['GET'])
def list_tags(request):
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


@api_view(['GET'])
def list_tag_problems(request, tag_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.Problem_ID,
                p.Problem_description,
                p.Review_status,
                t.Tag_ID,
                d.Difficulty_level,
                c.SQL_concept,
                p.Problem_title
            FROM PROBLEM p
            LEFT JOIN TAG t ON p.Tag_ID = t.Tag_ID
            LEFT JOIN DIFFICULTY_TAG d ON t.Difficulty_ID = d.Difficulty_ID
            LEFT JOIN CONCEPT_TAG c ON t.Concept_ID = c.Concept_ID
            WHERE t.Tag_ID = %s AND p.Review_status = 1;
        """, [tag_id])
        rows = cursor.fetchall()

    problems = []
    for r in rows:
        concept = r[5] or ""
        difficulty = r[4] or ""
        
        concept_tags = (
            [c.strip().capitalize() for c in concept.split(",")]
            if concept else []
        )
        
        problems.append({
            "pId": r[0],
            "pTitle": r[6] or "",
            "difficultyTag": difficulty.capitalize() if difficulty else "",
            "conceptTag": concept_tags,
            "pDescription": r[1] or "",
            # "pSolutionId": r[3],
            "reviewed": True if r[2] == 1 else False
        })

    return Response(problems)

