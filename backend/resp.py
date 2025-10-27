import re
import json

def evaluate_content(results):
    try:
        evaluations = []
        for item in results:
            if 'error' in item:
                continue
            
            content = item.get('content', '')
            if not content:
                continue
            
            # Calculate scores
            scores = {
                'id': item['id'],
                'scores': {
                    'clarity': evaluate_clarity(content),
                    'structure': evaluate_structure(content),
                    'engagement': evaluate_engagement(content),
                    'depth': evaluate_depth(content),
                    'formatting': evaluate_formatting(content)
                }
            }
            
            # Calculate average score
            avg_score = sum(scores['scores'].values()) / len(scores['scores'])
            scores['average_score'] = round(avg_score, 1)
            
            evaluations.append(scores)
            
        return {
            'status': 'success',
            'evaluations': evaluations
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

def evaluate_clarity(content: str) -> int:
    """Evaluates content clarity based on sentence structure and readability"""
    # Simple metrics for clarity
    avg_sentence_length = len(content.split()) / (len(re.split('[.!?]+', content)) + 1)
    score = 5
    if avg_sentence_length > 25: score -= 1
    if avg_sentence_length > 35: score -= 1
    if '###' not in content: score -= 1  # Checking for headers
    if len(content.split()) < 100: score -= 1
    return max(1, score)

def evaluate_structure(content: str) -> int:
    """Evaluates content structure and organization"""
    score = 5
    if not content.startswith('*'): score -= 1  # Check for title
    if '###' not in content: score -= 2  # Check for sections
    if '\n\n' not in content: score -= 1  # Check for paragraphs
    if len(content.split('\n\n')) < 3: score -= 1  # Check for multiple paragraphs
    return max(1, score)

def evaluate_engagement(content: str) -> int:
    """Evaluates how engaging the content is"""
    engagement_indicators = [
        '?', '!', 'imagine', 'consider', 'you', 'we', 'discover',
        'explore', 'learn', 'understand', 'revolutionize'
    ]
    score = 1
    for indicator in engagement_indicators:
        if indicator.lower() in content.lower():
            score += 0.5
    return min(5, round(score))

def evaluate_depth(content: str) -> int:
    """Evaluates content depth and comprehensiveness"""
    word_count = len(content.split())
    score = 1
    if word_count > 300: score += 1
    if word_count > 600: score += 1
    if word_count > 1000: score += 1
    if len(re.findall(r'\d+', content)) > 5: score += 1  # Check for data/statistics
    return min(5, score)

def evaluate_formatting(content: str) -> int:
    """Evaluates content formatting quality"""
    score = 5
    if '*' not in content: score -= 1  # Check for emphasis
    if '###' not in content: score -= 1  # Check for headers
    if '\n\n' not in content: score -= 1  # Check for proper spacing
    if len(content.split('\n')) < 10: score -= 1  # Check for proper structure
    if not re.search(r'\n\s*\n', content): score -= 1  # Check for paragraph breaks
    return max(1, score)

if __name__ == "__main__":
    with open('your_input.json', 'r') as file:
        json_input = file.read()
        result = evaluate_content(json.loads(json_input))
        print(json.dumps(result, indent=2))