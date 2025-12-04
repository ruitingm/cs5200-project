"""
Chatbot Views (NL to SQL)
Convert natural language text into SQL using LLM,
execute the SQL, and return the results.
"""

import openai
import re
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from datetime import datetime
from django.utils import timezone
import os

# Set OpenAI API key from environment - REQUIRED
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise RuntimeError("OPENAI_API_KEY environment variable is required")

# Database schema context for LLM - Updated with actual schema
DATABASE_SCHEMA = """
SQL Study Room Database Schema:

Core Tables:
1. PROBLEM (Problem_ID, Tag_ID, Problem_title, Problem_description, Review_status, Solution_ID)
2. TAG (Tag_ID, Difficulty_ID, Concept_ID)
3. DIFFICULTY_TAG (Difficulty_ID, Difficulty_level) - ENUM('EASY','MEDIUM','HARD')
4. CONCEPT_TAG (Concept_ID, SQL_concept) - e.g., 'BASIC','JOIN','AGGREGATION','CONDITIONAL'
5. SOLUTION (Solution_ID, Problem_ID, Solution_description, Review_status)

User Tables:
6. USER_PROFILE (Email, First_name, Last_name)
7. ACCOUNT (Account_number, Email, Register_date, Student_flag, Admin_flag)
8. USER_AUTH (Email, Password)

Activity Tables:
9. SUBMISSION (Submission_ID, Problem_ID, Account_number, Submission_description, Is_correct, Time_start, Time_end)
10. ATTEMPT (Attempt_ID, Problem_ID, Account_number, Attempt_number, Is_submitted, Submission_ID)
11. QUERY (Query_ID, Account_number, Model_ID, Natural_language_question, Generated_SQL, Generate_time)

Sample Queries:
- Easy problems: SELECT * FROM PROBLEM p JOIN TAG t ON p.Tag_ID = t.Tag_ID JOIN DIFFICULTY_TAG d ON t.Difficulty_ID = d.Difficulty_ID WHERE d.Difficulty_level = 'EASY'
- User submissions: SELECT * FROM SUBMISSION s JOIN ACCOUNT a ON s.Account_number = a.Account_number JOIN USER_PROFILE u ON a.Email = u.Email
- Problem statistics: SELECT p.Problem_ID, COUNT(s.Submission_ID) FROM PROBLEM p LEFT JOIN SUBMISSION s ON p.Problem_ID = s.Problem_ID GROUP BY p.Problem_ID
"""

def is_safe_sql(sql):
    """Check if SQL is safe (only SELECT statements)"""
    sql_clean = sql.strip().upper()
    # Remove comments and extra whitespace
    sql_clean = re.sub(r'--.*', '', sql_clean)
    sql_clean = re.sub(r'/\*.*?\*/', '', sql_clean, flags=re.DOTALL)
    sql_clean = ' '.join(sql_clean.split())
    
    # CRITICAL: Block multiple statements (SQL injection prevention)
    if ';' in sql_clean:
        return False
    
    # Allow SELECT and WITH (for CTEs)
    if not re.match(r'^(SELECT|WITH)\b', sql_clean):
        return False
    
    # Block dangerous keywords with word boundaries
    dangerous_keywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE']
    for keyword in dangerous_keywords:
        if re.search(rf'\b{keyword}\b', sql_clean):
            return False
    
    return True

def save_query_to_db(account_number, query_text):
    """Save query to QUERY table"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO QUERY (Account_number, Query_text, Query_time)
                VALUES (%s, %s, %s)
            """, [account_number, query_text, timezone.now()])
    except Exception as e:
        print(f"Failed to save query: {e}")

@api_view(["POST"])
def nl2sql(request):
    question = request.data.get("question")
    account_number = request.data.get("account_number", 1)  # Default for testing

    if not question:
        return Response({"error": "question required"}, status=400)

    try:
        # 1. Call OpenAI API
        client = openai.OpenAI(api_key=openai.api_key)
        
        prompt = f"""
{DATABASE_SCHEMA}

Convert this natural language question to a SQL SELECT query:
"{question}"

Rules:
- Only generate SELECT statements
- Use proper table JOINs when needed
- Return only the SQL query, no explanations
- Limit results to 50 rows maximum

SQL Query:
"""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a SQL expert. Generate only valid SELECT SQL queries."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.1
        )
        
        sql = response.choices[0].message.content.strip()
        
        # Clean up the SQL (remove markdown formatting if present)
        sql = re.sub(r'```sql\s*', '', sql)
        sql = re.sub(r'```\s*', '', sql)
        sql = sql.strip()
        
        # Enforce LIMIT 50 for performance protection
        if not re.search(r'\bLIMIT\b', sql, re.IGNORECASE):
            sql = f"({sql}) LIMIT 50"
        
        # 2. Validate SQL safety
        if not is_safe_sql(sql):
            return Response({
                "sql": sql,
                "results": [],
                "error": "Generated query is not safe. Only SELECT statements are allowed."
            }, status=400)
        
        # 3. Execute SQL
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                
                # Convert to list of dictionaries
                results = []
                for row in rows:
                    results.append(dict(zip(columns, row)))
                
                # 4. Save query to database
                save_query_to_db(account_number, sql)
                
                return Response({
                    "sql": sql,
                    "results": results,
                    "error": None,
                    "row_count": len(results)
                })
                
        except Exception as db_error:
            return Response({
                "sql": sql,
                "results": [],
                "error": f"Database error: {str(db_error)}"
            }, status=400)
            
    except Exception as openai_error:
        return Response({
            "sql": "",
            "results": [],
            "error": f"OpenAI API error: {str(openai_error)}"
        }, status=500)