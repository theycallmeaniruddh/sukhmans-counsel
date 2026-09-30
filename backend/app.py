import os
import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import models
import ai_client

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize SQLite database
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')
engine, Session = models.init_db(f"sqlite:///{DB_PATH}")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "app": "Sukhman's Counsel",
        "exam": "CLAT 2027",
        "exam_date": "December 6, 2026, 2:00 PM IST",
        "target": "NLS Bangalore",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    password = data.get('password', '').strip()
    username = data.get('username', 'Sukhman').strip()

    # Secret password: Sukhman0118
    if password == "Sukhman0118":
        return jsonify({
            "success": True,
            "user": {
                "name": "Sukhman",
                "role": "Aspiring NLS Scholar",
                "targetExam": "CLAT 2027",
                "targetDate": "December 6, 2026"
            },
            "token": "counsel-auth-token-sukhman-2027"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Invalid secret key. Hint: Sukhman0118"
        }), 401

@app.route('/api/chat/prep', methods=['POST'])
def chat_clat_prep_route():
    data = request.get_json() or {}
    messages = data.get('messages', [])
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    
    # Record chat interaction in database for real stats
    db_session = Session()
    try:
        db_session.add(models.UserActivity(action='chat', details=user_message[:100]))
        db_session.commit()
    except Exception as e:
        db_session.rollback()
    finally:
        db_session.close()

    reply = ai_client.chat_clat_prep(messages, user_message)
    return jsonify({
        "reply": reply,
        "role": "Counsel",
        "mode": "prep"
    })

@app.route('/api/chat/chill', methods=['POST'])
def chat_chill_space_route():
    data = request.get_json() or {}
    messages = data.get('messages', [])
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    
    # Record chat interaction in database for real stats
    db_session = Session()
    try:
        db_session.add(models.UserActivity(action='chat', details=user_message[:100]))
        db_session.commit()
    except Exception as e:
        db_session.rollback()
    finally:
        db_session.close()

    reply = ai_client.chat_chill_space(messages, user_message)
    return jsonify({
        "reply": reply,
        "role": "Counsel",
        "mode": "chill"
    })

@app.route('/api/quiz/generate', methods=['POST'])
def quiz_generate_route():
    data = request.get_json() or {}
    topic = data.get('topic', 'Constitutional Law')
    count = int(data.get('count', 20))
    count = max(5, min(count, 50))  # bounds check

    questions = ai_client.generate_quiz(topic=topic, question_count=count)
    return jsonify({
        "topic": topic,
        "count": len(questions),
        "questions": questions
    })

@app.route('/api/quiz/submit', methods=['POST'])
def quiz_submit_route():
    data = request.get_json() or {}
    topic = data.get('topic', 'General CLAT')
    score = int(data.get('score', 0))
    total = int(data.get('total', 1))
    percentage = float(data.get('percentage', 0.0))
    badge = data.get('badge', 'Keep Grinding 💪')

    db_session = Session()
    try:
        record = models.QuizResult(
            topic=topic,
            score=score,
            total_questions=total,
            percentage=percentage,
            badge=badge
        )
        db_session.add(record)
        db_session.commit()
        return jsonify({"recorded": True, "id": record.id})
    except Exception as e:
        db_session.rollback()
        return jsonify({"recorded": False, "error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/api/planner/generate', methods=['POST'])
def planner_generate_route():
    data = request.get_json() or {}
    weak_topics = data.get('weak_topics', [])
    days_remaining = int(data.get('days_remaining', 70))
    daily_hours = int(data.get('daily_hours', 4))

    plan = ai_client.generate_study_plan(weak_topics, days_remaining, daily_hours)
    return jsonify({
        "days_remaining": days_remaining,
        "daily_hours": daily_hours,
        "plan": plan
    })

@app.route('/api/current-affairs', methods=['GET'])
def current_affairs_route():
    digest = ai_client.generate_current_affairs_digest()
    return jsonify({
        "digest": digest,
        "count": len(digest),
        "targetExam": "CLAT 2027",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%B %d, %Y")
    })

@app.route('/api/bookmarks', methods=['GET'])
def get_bookmarks():
    db_session = Session()
    try:
        items = db_session.query(models.Bookmark).order_by(models.Bookmark.id.desc()).all()
        return jsonify({
            "bookmarks": [
                {
                    "id": b.id,
                    "item_type": b.item_type,
                    "title": b.title,
                    "content": b.content,
                    "topic": b.topic,
                    "timestamp": b.timestamp.isoformat() if b.timestamp else None
                }
                for b in items
            ]
        })
    except Exception as e:
        return jsonify({"bookmarks": [], "error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/api/bookmarks', methods=['POST'])
def save_bookmark():
    data = request.get_json() or {}
    item_type = data.get('item_type', 'article')
    title = data.get('title', '')
    content = data.get('content', '')
    topic = data.get('topic', 'General')

    db_session = Session()
    try:
        bm = models.Bookmark(
            item_type=item_type,
            title=title,
            content=content if isinstance(content, str) else json.dumps(content),
            topic=topic
        )
        db_session.add(bm)
        db_session.commit()
        return jsonify({"success": True, "id": bm.id})
    except Exception as e:
        db_session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/api/bookmarks/<int:b_id>', methods=['DELETE'])
def delete_bookmark(b_id):
    db_session = Session()
    try:
        bm = db_session.query(models.Bookmark).filter_by(id=b_id).first()
        if bm:
            db_session.delete(bm)
            db_session.commit()
            return jsonify({"success": True})
        return jsonify({"success": False, "message": "Bookmark not found"}), 404
    except Exception as e:
        db_session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/api/stats', methods=['GET'])
def get_stats():
    db_session = Session()
    try:
        quizzes = db_session.query(models.QuizResult).all()
        quizzes_count = len(quizzes)
        avg_score = round(sum(q.percentage for q in quizzes) / max(1, quizzes_count), 1) if quizzes_count > 0 else 0
        
        # Real unique topics actually attempted in quizzes
        unique_topics = sorted(list({q.topic for q in quizzes if q.topic}))
        
        # Real count of user chat interactions
        chat_count = db_session.query(models.UserActivity).filter_by(action='chat').count()

        return jsonify({
            "chats_count": chat_count,
            "quizzes_taken": quizzes_count,
            "avg_score": avg_score,
            "topics_covered": unique_topics
        })
    except Exception as e:
        return jsonify({
            "chats_count": 0,
            "quizzes_taken": 0,
            "avg_score": 0,
            "topics_covered": []
        })
    finally:
        db_session.close()

@app.route('/api/reset', methods=['POST'])
def reset_all_data():
    db_session = Session()
    try:
        db_session.query(models.QuizResult).delete()
        db_session.query(models.Bookmark).delete()
        db_session.query(models.UserActivity).delete()
        db_session.commit()
        return jsonify({
            "success": True,
            "message": "All database records, quizzes, bookmarks, and chat history reset to 0."
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db_session.close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"⚖️ Starting Sukhman's Counsel Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
