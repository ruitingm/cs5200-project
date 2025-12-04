"""
- list_problems: returns a JSON list of all problems 
- get_problem: returns one problem
- submit_problem: handles submitting a solution for a problem (inserting into SUBMISSION table)  
"""
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
                p.Review_status,
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
        views = row[2] 
        solutions = row[3] 
        difficulty = row[4] or ""
        concept = row[5] or ""

        # Generate title
        p_title = description.split("\n")[0][:80]

        concept_tags = (
            [c.strip().capitalize() for c in concept.split(",")]
            if concept else []
        )

        results.append({
            "pId": problem_id,
            "pTitle": p_title,
            "difficultyTag": difficulty.capitalize(),
            "conceptTag": concept_tags,
            "pDescription": description,
            "pSolutionId": solutions,   # TODO: replace with real Solution_ID
            "reviewed": True if views == 1 else False   
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
            WHERE p.Problem_ID = %s AND p.Review_status = 1
        """, [pid])

        row = cursor.fetchone()

        if row is None:
            return JsonResponse({"error": "Problem not found"}, status=404)

    problem_id = row[0]
    description = row[1]
    tag_id = row[2]
    difficulty = row[3]
    concept = row[4]

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

#add problem

@api_view(["POST"])
def add_problem(request):
    """
    Add a new problem into PROBLEM table
    Required: tag_id, problem_title, problem_description
    Optional: solution_id, review_status
    """
    data = json.loads(request.body)

    tag_id = data.get("tag_id")
    title = data.get("problem_title")
    description = data.get("problem_description")
    solution_id = data.get("solution_id")  # can be None
    review_status = data.get("review_status", False)

    if not tag_id or not title or not description:
        return JsonResponse({"error": "Missing required fields"}, status=400)

    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO PROBLEM (Tag_ID, Problem_title, Problem_description, Review_status, Solution_ID)
            VALUES (%s, %s, %s, %s, %s)
        """, [tag_id, title, description, review_status, solution_id])

        cursor.execute("SELECT LAST_INSERT_ID()")
        new_id = cursor.fetchone()[0]

    return JsonResponse({"success": True, "problem_id": new_id})


#delete problem
@api_view(["DELETE"])
def delete_problem(request, pid):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM PROBLEM WHERE Problem_ID = %s", [pid])
        deleted = cursor.rowcount

    if deleted == 0:
        return JsonResponse({"error": "Problem not found"}, status=404)

    return JsonResponse({"success": True, "deleted_id": pid})

## eid problems
@api_view(["PUT"])
def update_problem(request, pid):
    """
    Update a problem by Problem_ID
    """
    data = json.loads(request.body)

    title = data.get("title")
    description = data.get("description")
    tag_id = data.get("tagId")

    if not title or not description or not tag_id:
        return JsonResponse({"error": "Missing fields"}, status=400)

    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE PROBLEM
            SET Problem_title = %s,
                Problem_description = %s,
                Tag_ID = %s
            WHERE Problem_ID = %s
        """, [title, description, tag_id, pid])

        updated = cursor.rowcount
    print("==== UPDATE PAYLOAD ====")
    print("title:", title)
    print("description:", description)
    print("tag_id:", tag_id)
    if updated == 0:
        return JsonResponse({"error": "Problem not found"}, status=404)
        

    return JsonResponse({"success": True, "updated_id": pid})
    

@api_view(['POST'])
def publish_problem(request, pid):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE PROBLEM
            SET Views = 1
            WHERE Problem_ID = %s
        """, [pid])

    return Response({"success": True})
